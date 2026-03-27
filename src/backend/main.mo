import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Stripe "./stripe/stripe";
import OutCall "./http-outcalls/outcall";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  // -- Authorization --
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // -- Types --
  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    description : Text;
    imageUrl : Text;
    discountPercent : Nat;
    stock : Nat;
    sellerId : Principal;
    rating : Nat;
  };

  public type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    priceAtPurchase : Nat;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    buyerId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    status : OrderStatus;
    createdAt : Int;
    paymentIntentId : Text;
    shippingAddress : Text;
  };

  // -- State --
  stable var nextProductId : Nat = 1;
  stable var nextOrderId : Nat = 1;
  stable var stripePublishableKey : Text = "";
  stable var stripeSecretKey : Text = "";
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let sellerRoles = Map.empty<Principal, Bool>();

  // -- Helpers --
  func allProducts() : [Product] {
    products.toArray().map(func((_, v) : (Nat, Product)) : Product { v });
  };

  func allOrders() : [Order] {
    orders.toArray().map(func((_, v) : (Nat, Order)) : Order { v });
  };

  // -- HTTP transform for outcalls --
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // -- Stripe --
  public shared ({ caller }) func setStripeKeys(secretKey : Text, publishableKey : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    stripeSecretKey := secretKey;
    stripePublishableKey := publishableKey;
  };

  public query func getStripePublishableKey() : async Text {
    stripePublishableKey;
  };

  public shared ({ caller }) func createStripeCheckoutSession(
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text,
  ) : async Text {
    let config : Stripe.StripeConfiguration = {
      secretKey = stripeSecretKey;
      allowedCountries = ["IN"];
    };
    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };

  public shared func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let config : Stripe.StripeConfiguration = {
      secretKey = stripeSecretKey;
      allowedCountries = ["IN"];
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  // -- Seller Management --
  public shared ({ caller }) func registerAsSeller() : async () {
    if (caller.isAnonymous()) Runtime.trap("Must be logged in");
    sellerRoles.add(caller, true);
  };

  public query ({ caller }) func isSeller() : async Bool {
    switch (sellerRoles.get(caller)) {
      case (?v) v;
      case null false;
    };
  };

  // -- Product Management --
  public shared ({ caller }) func addProduct(
    name : Text,
    category : Text,
    price : Nat,
    description : Text,
    imageUrl : Text,
    discountPercent : Nat,
    stock : Nat,
  ) : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Must be logged in");
    let isSel = switch (sellerRoles.get(caller)) { case (?v) v; case null false };
    if (not isSel and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Must be a seller");
    let id = nextProductId;
    nextProductId += 1;
    products.add(id, { id; name; category; price; description; imageUrl; discountPercent; stock; sellerId = caller; rating = 45 });
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    category : Text,
    price : Nat,
    description : Text,
    imageUrl : Text,
    discountPercent : Nat,
    stock : Nat,
  ) : async () {
    switch (products.get(id)) {
      case null Runtime.trap("Product not found");
      case (?p) {
        if (p.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
        products.add(id, { p with name; category; price; description; imageUrl; discountPercent; stock });
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    switch (products.get(id)) {
      case null Runtime.trap("Product not found");
      case (?p) {
        if (p.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
        products.remove(id);
      };
    };
  };

  public query func getAllProducts() : async [Product] {
    allProducts();
  };

  public query ({ caller }) func getMyProducts() : async [Product] {
    allProducts().filter(func(p : Product) : Bool { p.sellerId == caller });
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  // -- Order Management --
  public shared ({ caller }) func placeOrder(
    items : [OrderItem],
    totalAmount : Nat,
    paymentIntentId : Text,
    shippingAddress : Text,
  ) : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Must be logged in");
    let id = nextOrderId;
    nextOrderId += 1;
    orders.add(id, { id; buyerId = caller; items; totalAmount; status = #pending; createdAt = 0; paymentIntentId; shippingAddress });
    id;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case null Runtime.trap("Order not found");
      case (?o) {
        let isSel = switch (sellerRoles.get(caller)) { case (?v) v; case null false };
        if (not isSel and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
        orders.add(orderId, { o with status });
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    allOrders().filter(func(o : Order) : Bool { o.buyerId == caller });
  };

  public query ({ caller }) func getOrdersForSeller() : async [Order] {
    let isSel = switch (sellerRoles.get(caller)) { case (?v) v; case null false };
    let isAdm = AccessControl.isAdmin(accessControlState, caller);
    if (not isSel and not isAdm) Runtime.trap("Unauthorized");
    allOrders().filter(
      func(o : Order) : Bool {
        if (isAdm) return true;
        o.items.any(func(item : OrderItem) : Bool {
          switch (products.get(item.productId)) {
            case (?p) p.sellerId == caller;
            case null false;
          };
        });
      },
    );
  };
};
