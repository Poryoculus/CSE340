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


// ✅ Client-side validation
  const form = document.getElementById('add-classification-form');
  form.addEventListener('submit', e => {
    const input = document.getElementById('classification_name');
    const pattern = /^[A-Za-z0-9]+$/;
    if (!pattern.test(input.value)) {
      e.preventDefault();
      alert('Classification name cannot contain spaces or special characters.');
    }
  });