/* ===============================
   GitSnap Auth System
   =============================== */

   const AUTH_KEY = "gitsnap_current_user";

   /* ---------- Helpers ---------- */
   
   function generateUserId(first, last) {
       return (
           first.trim().toLowerCase() +
           "_" +
           last.trim().toLowerCase() +
           "_" +
           Date.now()
       ).replace(/\s+/g, "");
   }
   
   function generateSecretKey() {
       return (
           Math.random().toString(36).substring(2) +
           Math.random().toString(36).substring(2) +
           Date.now()
       );
   }
   
   function saveSession(user) {
       localStorage.setItem(AUTH_KEY, JSON.stringify(user));
   }
   
   function getSession() {
       const data = localStorage.getItem(AUTH_KEY);
       return data ? JSON.parse(data) : null;
   }
   
   /* ---------- Global AuthManager ---------- */
   
   window.AuthManager = {
       isAuthenticated() {
           return getSession() !== null;
       },
   
       getCurrentUser() {
           return getSession();
       },
   
       logout() {
           localStorage.removeItem(AUTH_KEY);
           window.location.href = "auth.html";
       }
   };
   
   /* ---------- Tabs ---------- */
   
   function switchTab(tab) {
       document.querySelectorAll(".tab-btn").forEach(btn => {
           btn.classList.remove("active");
       });
   
       document.querySelectorAll(".auth-form").forEach(form => {
           form.classList.remove("active");
       });
   
       document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
       document.getElementById(tab + "-tab").classList.add("active");
   }
   
   /* ---------- Auth Page Only ---------- */
   
   document.addEventListener("DOMContentLoaded", () => {
   
       const signupForm = document.getElementById("signupForm");
       const signinForm = document.getElementById("signinForm");
   
       /* Tab buttons */
       document.querySelectorAll(".tab-btn").forEach(btn => {
           btn.addEventListener("click", () => {
               switchTab(btn.dataset.tab);
           });
       });
   
       /* ---------- Signup ---------- */
   
       if (signupForm) {
           signupForm.addEventListener("submit", e => {
               e.preventDefault();
   
               const first = document.getElementById("firstName").value.trim();
               const last = document.getElementById("lastName").value.trim();
   
               const user = {
                   userId: generateUserId(first, last),
                   fullName: first + " " + last,
                   secretKey: generateSecretKey(),
                   joinedAt: Date.now()
               };
   
               saveSession(user);
   
               /* Download key file */
               const blob = new Blob(
                   [JSON.stringify(user, null, 2)],
                   { type: "text/plain" }
               );
   
               const link = document.createElement("a");
               link.href = URL.createObjectURL(blob);
               link.download = "gitsnap-secret.key";
               link.click();
   
               alert("Account created. Secret key downloaded.");
               window.location.href = "dashboard.html";
           });
       }
   
       /* ---------- Signin ---------- */
   
       if (signinForm) {
           signinForm.addEventListener("submit", e => {
               e.preventDefault();
   
               const enteredName =
                   document.getElementById("signinUsername").value.trim();
   
               const file =
                   document.getElementById("secretKeyFile").files[0];
   
               if (!file) {
                   alert("Please upload your key file.");
                   return;
               }
   
               const reader = new FileReader();
   
               reader.onload = function (event) {
                   try {
                       const user = JSON.parse(event.target.result);
   
                       if (
                           user.fullName.toLowerCase() ===
                           enteredName.toLowerCase()
                       ) {
                           saveSession(user);
                           alert("Login successful.");
                           window.location.href = "dashboard.html";
                       } else {
                           alert("Invalid name or key file.");
                       }
   
                   } catch {
                       alert("Invalid key file.");
                   }
               };
   
               reader.readAsText(file);
           });
       }
   
   });