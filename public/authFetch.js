let authFetch = async (url, options = {}, flag) => {
  let token = localStorage.getItem("token") || "";
  console.log("token: ", token);
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status == 401 && flag) {
    let newRes = await fetch("/users/token/refresh", {
      method: "POST",
    });
    let data = await newRes.json();
    let newAccessToken = data.newAccessToken;

    console.log("got new token", newAccessToken);
    localStorage.setItem("token", newAccessToken);
    return await authFetch(url, options, !flag);
  }
  return await res.json();
};

const testBtn = document.querySelector(".test-btn");
if (testBtn) {
  console.log("BO CO TON TAI");
  testBtn.addEventListener("click", async (e) => {
    let res = await authFetch(
      "/test",
      {
        method: "POST",
        headers: {
          hello: "yes",
        },
      },
      true,
    );
    console.log("CHECK:", res);
  });
}
