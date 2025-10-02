document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility
  const togglePassword = document.querySelector("#togglePassword");
  const password = document.querySelector("#password"); 


 togglePassword.addEventListener("click", () => {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    togglePassword.textContent = type === "password" ? "Show" : "Hide";
  });
});