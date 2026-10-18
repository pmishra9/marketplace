The Storefront web app needs to have the following features

Be able to search a product and show it in a grid view
Be able to sort products by
Relevance
Price low to high
Price high to low
Name

Filter by
Relevance
Discount
Brand


Product display page:
Product Title
Show Product Picture
Product Descriptions
Show product variants
Able to update the product quantity and select different variants
Add to Cart button
Subscribe button
Checkout



During the checkout flow:
If not signed in already, allow the customer to sign up

In the checkout page,
Show the price summary with items in the cart
Show the discounts
Tax
Total amount to pay

Allow to enter the payment information or select the payment if saved before
Prompt for the confirmation to order
Show the confirmation page
Email the receipt to the customer

## Current implementation gaps

- Local checkout authorizes only the whitelisted test card `4242 4242 4242 4242` (future expiry and any 3-digit CVC). This mock mode is disabled in production and does not charge or store a real card number. A Stripe test-mode integration is still required for provider-backed payment testing.
- The backend generates and logs a receipt preview. It does not deliver email; an email provider is still required.
- Customer sign-in is held in frontend memory and is lost on reload. A server-backed session or token flow is still required for persistent sign-in.
- Product search, relevance sorting, brand and discount filters, variants, cart, and the checkout summary are implemented in the storefront. The “Relevance” filter wording above is ambiguous because relevance is a sort mode, not a separate filter.
