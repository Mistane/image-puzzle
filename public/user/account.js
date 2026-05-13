const registerForm = document.querySelector("#register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("hello");
    const usernameField = registerForm.querySelector("#username-register");
    const passwordField = registerForm.querySelector("#password-register");
    console.log(usernameField.value, passwordField.value);
    let res = await fetch("/account/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameField.value,
        password: passwordField.value,
      }),
    });
    let data = await res.json();
    console.log(data);
    if (data["errors"]) {
      alert("Please enter all information");
    } else {
      alert(data["msg"]);
      usernameField.value = "";
      passwordField.value = "";
    }
  });
}

const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("hello");
    const usernameField = loginForm.querySelector("#username-login");
    const passwordField = loginForm.querySelector("#password-login");
    console.log(usernameField.value, passwordField.value);
    let res = await fetch("/account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameField.value,
        password: passwordField.value,
      }),
    });
    let data = await res.json();
    console.log(data);
    if (data["errors"]) {
      alert("Please enter all information");
    } else {
      localStorage.setItem("token", data.accessToken);
      alert(data["msg"]);
      usernameField.value = "";
      passwordField.value = "";
    }
  });
}
