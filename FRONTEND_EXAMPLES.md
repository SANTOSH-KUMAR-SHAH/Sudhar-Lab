Frontend examples for interacting with backend auth/provider endpoints

Notes:
- If the backend sets a httpOnly cookie on login, the browser will only accept the Set-Cookie header if the request is made with credentials: 'include'.
- For subsequent protected requests that rely on the cookie, also use credentials: 'include'.
- Alternatively, if you store the token in localStorage (less secure), send it in Authorization header: "Bearer <token>".

1) Login (cookie flow)

```javascript
// POST login and allow cookie to be set
const res = await fetch("https://your-backend.com/api/auth/login", {
  method: "POST",
  credentials: 'include', // IMPORTANT: allows browser to accept Set-Cookie from server
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await res.json();

// If server also returns token in body you can store it, but prefer cookie-based flow
```

2) Become provider (use cookie flow)

```javascript
// call become-provider endpoint after login
const res = await fetch("https://your-backend.com/api/become-provider/", {
  method: 'POST',
  credentials: 'include', // send cookie
});
const data = await res.json();
console.log(data.profile); // will contain providerProfile.id if successful
```

3) Add a service (provider)

```javascript
const payload = {
  categoryId: '<category-id>',
  subcategoryId: '<subcategory-id-or-null>',
  price: 500.0,
  description: 'I provide plumbing services'
};

const res = await fetch('https://your-backend.com/api/services', {
  method: 'POST',
  credentials: 'include', // send auth cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
const data = await res.json();
console.log(data);
```

4) If you prefer Authorization header flow (token in localStorage)

```javascript
// store returned token after login (not recommended for sensitive apps)
localStorage.setItem('token', data.token);

const res = await fetch('https://your-backend.com/api/services', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify(payload)
});
```

Troubleshooting:
- If you see that Set-Cookie is missing from login response in DevTools Network panel, ensure the login request used credentials: 'include' and that server sets cookie with SameSite/secure correctly.
- In development (http://localhost), cookie `secure: true` will prevent the cookie from being set. Use `secure` only in production (HTTPS).
- Make sure backend CORS has `credentials: true` and `origin` matches your frontend origin.
