import { trackEvent } from "../utils/analytics";

const VENDOR_ID = process.env.NODE_ENV === "development" ? 1506 : 128190;
const PRODUCT_ID = process.env.NODE_ENV === "development" ? 9822 : 648884;

function loadPaddle() {
  return new Promise((resolve) => {
    var script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/paddle.js";
    script.async = true;
    var firstScriptElement = document.getElementsByTagName("script")[0];
    script.onload = function () {
      if (process.env.NODE_ENV === "development")
        window.Paddle.Environment.set("sandbox");
      window.Paddle.Setup({ vendor: VENDOR_ID });
      resolve();
    };
    firstScriptElement.parentNode.insertBefore(script, firstScriptElement);
  });
}

async function upgrade(user, coupon) {
  if (!window.Paddle) {
    await loadPaddle();
  }

  const { Paddle } = window;
  if (!Paddle) return;

  if (coupon) {
    trackEvent(`[${coupon}] redeemed!`, "offers");
  } else {
    trackEvent(`Checkout requested`, "checkout");
  }

  Paddle.Checkout.open({
    product: PRODUCT_ID,
    email: user.email,
    coupon,
    passthrough: JSON.stringify({
      userId: user.id,
    }),
  });
}

async function openPaddleDialog(overrideUrl) {
  if (!window.Paddle) {
    await loadPaddle();
  }

  const { Paddle } = window;
  if (!Paddle) return;

  Paddle.Checkout.open({
    override: overrideUrl,
    product: PRODUCT_ID,
  });
}

export { upgrade, openPaddleDialog };
// (async () => await upgrade())();
