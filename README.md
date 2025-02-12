# UTTS Frontend

## GitHub Pages Setup Instructions

1. Create a new GitHub repository named 'utts'

2. Push the frontend code to GitHub:
```bash
cd utts-frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/cwu2020/utts.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to your repository settings
   - Scroll down to "GitHub Pages" section
   - Under "Source", select "main" branch
   - Under "Folder", select "/ (root)"
   - Click Save
   - Wait a few minutes for your site to be published at https://cwu2020.github.io/utts/

4. Configure Auth0:
   - Log into your Auth0 Dashboard
   - Go to Applications > Applications
   - Select your UTTS application
   - Under "Allowed Callback URLs", add:
     ```
     https://cwu2020.github.io/utts/dashboard.html
     ```
   - Under "Allowed Logout URLs", add:
     ```
     https://cwu2020.github.io/utts/index.html
     ```
   - Under "Allowed Web Origins", add:
     ```
     https://cwu2020.github.io
     ```
   - Click "Save Changes"

5. Test the deployment:
   - Visit https://cwu2020.github.io/utts/
   - Try logging in and verify the authentication flow works
   - Check the browser console for any errors

## Development Setup

For local development:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

This will run the frontend on http://localhost:8080

## Notes

- The frontend is configured to work with both GitHub Pages and local development
- The backend API URL is still set to http://localhost:3000 - make sure your backend is running locally when testing
- Auth0 configuration automatically handles the different environments based on the URL
