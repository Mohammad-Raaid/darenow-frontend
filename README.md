# DareNow Frontend - Technical Documentation & Setup Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Development Workflow](#development-workflow)
8. [Architecture Overview](#architecture-overview)
9. [Authentication System](#authentication-system)
10. [API Integration](#api-integration)
11. [Key Features](#key-features)
12. [Component Documentation](#component-documentation)
13. [Routing](#routing)
14. [Styling](#styling)
15. [State Management](#state-management)
16. [Error Handling](#error-handling)
17. [Testing](#testing)
18. [Build & Deployment](#build--deployment)
19. [Troubleshooting](#troubleshooting)
20. [Contributing](#contributing)

---

## Project Overview

**DareNow** is a restaurant management and table booking platform that allows:
- **Admin Users**: Manage restaurants, view bookings, and oversee the platform
- **Restaurant Owners**: Manage their restaurant details, view bookings, and create bookings
- **End Users**: Search and book tables at restaurants

### Key Capabilities

- Restaurant CRUD operations (Create, Read, Update, Delete)
- Restaurant image management (logo, detail images, menu images)
- Table booking management
- User authentication and authorization
- Restaurant owner authentication (separate from admin)
- Responsive design with modern UI/UX

---

## Technology Stack

### Core Technologies

- **React 19.2.0** - UI library
- **React Router DOM 7.9.4** - Client-side routing
- **Axios 1.12.2** - HTTP client for API calls
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Create React App 5.0.1** - Build tooling and development environment

### Development Tools

- **Node.js** - JavaScript runtime
- **npm** - Package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Testing

- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM matchers for Jest
- **@testing-library/user-event** - User interaction simulation

---

## Project Structure

```
darenow-frontend/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   ├── favicon.ico             # Site icon
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots file
│   └── *.png                   # Logo and image assets
│
├── src/                        # Source code
│   ├── components/             # Reusable components
│   │   ├── ConfirmationModal.js
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   ├── RestaurantProtectedRoute.js
│   │   ├── Sidebar.js
│   │   ├── TimePicker.js
│   │   └── Toast.js
│   │
│   ├── context/               # React Context providers
│   │   └── AuthContext.js     # Authentication context
│   │
│   ├── pages/                  # Page components
│   │   ├── BookingsList.js
│   │   ├── Contact.js
│   │   ├── CreateBooking.js
│   │   ├── CreateRestaurant.js
│   │   ├── Dashboard.js
│   │   ├── EditRestaurant.js
│   │   ├── ForgotPassword.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── PrivacyPolicy.js
│   │   ├── Register.js
│   │   ├── ResetPassword.js
│   │   ├── RestaurantDetails.js
│   │   ├── RestaurantList.js
│   │   ├── RestaurantLogin.js
│   │   ├── TermsConditions.js
│   │   └── UpdatePassword.js
│   │
│   ├── utils/                  # Utility functions
│   │   └── api.js              # API client configuration
│   │
│   ├── App.js                  # Main application component
│   ├── App.css                 # Global styles
│   ├── App.test.js             # App component tests
│   ├── index.js                # Application entry point
│   ├── index.css               # Global CSS
│   ├── reportWebVitals.js      # Performance monitoring
│   └── setupTests.js           # Test configuration
│
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── README.md                   # Basic project readme
└── TECHNICAL_DOCUMENTATION.md  # This file
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Node.js** (v14.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **Git** (for version control)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Code Editor** (recommended: VS Code)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd darenow-frontend
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install all packages listed in `package.json`:
- React and React DOM
- React Router DOM
- Axios
- Tailwind CSS and related plugins
- Testing libraries

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following environment variables:

```env
# API Base URL
REACT_APP_API_BASE_URL=http://3.111.88.208:3000/api

# Optional: Set to 'production' for production builds
REACT_APP_ENV=development
```

**Note**: If `REACT_APP_API_BASE_URL` is not set, the application defaults to `http://3.111.88.208:3000/api`.

### Step 4: Start Development Server

```bash
# Start the development server
npm start
```

The application will:
- Start on `http://localhost:3000`
- Automatically open in your default browser
- Hot-reload when you make changes to the code

### Step 5: Verify Installation

1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. Check the browser console for any errors

---

## Configuration

### API Configuration

The API client is configured in `src/utils/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://3.111.88.208:3000/api';
```

**Key Features:**
- Automatic token injection via request interceptors
- Separate token handling for restaurant and admin routes
- Automatic redirect on 401 (unauthorized) errors
- Error handling for public routes

### Tailwind CSS Configuration

Tailwind is configured in `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**Customization:**
- Add custom colors, fonts, or spacing in the `theme.extend` object
- Add custom plugins in the `plugins` array

### PostCSS Configuration

PostCSS is configured in `postcss.config.js` to process Tailwind CSS and Autoprefixer.

---

## Development Workflow

### Available Scripts

#### `npm start`
- Starts the development server
- Runs on `http://localhost:3000`
- Enables hot module replacement (HMR)
- Opens browser automatically

#### `npm test`
- Launches the test runner in interactive watch mode
- Runs tests using Jest and React Testing Library
- Press `a` to run all tests
- Press `q` to quit watch mode

#### `npm run build`
- Creates an optimized production build
- Outputs to `build/` directory
- Minifies JavaScript and CSS
- Generates source maps
- Ready for deployment

#### `npm run eject`
- **⚠️ Warning: One-way operation**
- Ejects from Create React App
- Copies configuration files to project
- Gives full control over build tools
- Cannot be undone

### Development Best Practices

1. **Code Formatting**
   - Use consistent indentation (2 spaces)
   - Follow React component naming conventions (PascalCase)
   - Use functional components with hooks

2. **Component Structure**
   ```javascript
   // Component template
   import React, { useState, useEffect } from 'react';
   
   const ComponentName = () => {
     // State declarations
     const [state, setState] = useState(initialValue);
     
     // Effects
     useEffect(() => {
       // Effect logic
     }, [dependencies]);
     
     // Event handlers
     const handleEvent = () => {
       // Handler logic
     };
     
     // Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   };
   
   export default ComponentName;
   ```

3. **File Naming**
   - Components: `PascalCase.js` (e.g., `RestaurantList.js`)
   - Utilities: `camelCase.js` (e.g., `api.js`)
   - Constants: `UPPER_SNAKE_CASE.js` (if needed)

4. **Import Organization**
   ```javascript
   // 1. React and React-related imports
   import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   
   // 2. Third-party libraries
   import axios from 'axios';
   
   // 3. Internal utilities and contexts
   import api from '../utils/api';
   import { useAuth } from '../context/AuthContext';
   
   // 4. Components
   import Navbar from '../components/Navbar';
   
   // 5. Styles (if any)
   import './Component.css';
   ```

---

## Architecture Overview

### Application Flow

```
User Request
    ↓
React Router (App.js)
    ↓
Route Matching
    ↓
Protected Route Check (if required)
    ↓
Page Component
    ↓
API Call (via api.js)
    ↓
Response Handling
    ↓
State Update
    ↓
UI Re-render
```

### Component Hierarchy

```
App
├── AuthProvider
│   └── ToastProvider
│       └── Router
│           ├── Navbar
│           ├── Routes
│           │   ├── Public Routes
│           │   │   ├── Login
│           │   │   ├── Register
│           │   │   └── ...
│           │   └── Protected Routes
│           │       ├── Dashboard
│           │       ├── RestaurantList
│           │       └── ...
│           └── Footer
```

---

## Authentication System

### Authentication Types

The application supports two types of authentication:

1. **Admin Authentication**
   - Used for admin dashboard and restaurant management
   - Token stored in `localStorage` as `token`
   - User data stored as `user`

2. **Restaurant Authentication**
   - Used for restaurant owner dashboard
   - Token stored in `localStorage` as `restaurantToken`
   - Restaurant data stored as `restaurant`

### AuthContext

Located in `src/context/AuthContext.js`, provides:

**State:**
- `isAuthenticated` - Boolean indicating auth status
- `user` - Current user object
- `token` - Authentication token
- `loading` - Loading state

**Methods:**
- `login(username, password)` - Admin login
- `register(name, email, password)` - User registration
- `logout()` - Clear authentication
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, password)` - Reset password

### Usage Example

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(username, password);
    if (result.success) {
      // Redirect or show success
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### Protected Routes

**Admin Protected Routes** (`ProtectedRoute.js`):
- Checks for admin token
- Redirects to `/login` if not authenticated
- Used for: Dashboard, Restaurant Management, etc.

**Restaurant Protected Routes** (`RestaurantProtectedRoute.js`):
- Checks for restaurant token
- Redirects to `/restaurant/login` if not authenticated
- Used for: Restaurant Bookings, Create Booking, etc.

---

## API Integration

### API Client Setup

The API client (`src/utils/api.js`) is configured with:

1. **Base URL Configuration**
   ```javascript
   const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://3.111.88.208:3000/api';
   ```

2. **Request Interceptor**
   - Automatically adds `Authorization` header with Bearer token
   - Selects appropriate token (admin or restaurant) based on route

3. **Response Interceptor**
   - Handles 401 (Unauthorized) errors
   - Clears tokens and redirects to appropriate login page
   - Preserves public routes

### Making API Calls

```javascript
import api from '../utils/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// POST request
const createData = async (data) => {
  try {
    const response = await api.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// PUT request
const updateData = async (id, data) => {
  try {
    const response = await api.put(`/endpoint/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// DELETE request
const deleteData = async (id) => {
  try {
    const response = await api.delete(`/endpoint/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// File upload (multipart/form-data)
const uploadFile = async (endpoint, formData) => {
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### API Endpoints Reference

#### Authentication
- `GET /admin/login/username/{username}/password/{password}` - Admin login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Restaurants (Places)
- `GET /place` - List all restaurants
- `GET /place/{id}` - Get restaurant details
- `POST /place` - Create restaurant
- `PUT /place` - Update restaurant
- `DELETE /place/{id}` - Delete restaurant
- `POST /place/{id}/addLogo` - Upload logo
- `POST /place/{id}/addDetailImage` - Upload detail images (batch)
- `POST /place/{id}/addFoodMenuImages` - Upload food menu images
- `POST /place/{id}/addBeveragesMenuImages` - Upload beverages menu images

#### Restaurant Login
- `POST /place/login` - Restaurant owner login

#### Bookings
- `GET /table-booking` - List bookings
- `POST /table-booking` - Create booking
- `GET /place/{id}/slots` - Get available time slots

#### Interests
- `GET /interest` - List interests

---

## Key Features

### 1. Restaurant Management

**Create Restaurant** (`CreateRestaurant.js`):
- Comprehensive form with validation
- Image uploads (logo, detail images, menu images)
- Time management (opening/closing hours, meal times)
- Location data (address, latitude, longitude)
- Pricing and offers configuration

**Edit Restaurant** (`EditRestaurant.js`):
- Update existing restaurant details
- Add/remove images
- Maintain existing data while updating

**Restaurant List** (`RestaurantList.js`):
- Display all restaurants
- Search and filter capabilities
- Navigation to details and edit pages

**Restaurant Details** (`RestaurantDetails.js`):
- View complete restaurant information
- Display all images
- View booking information

### 2. Image Management

**Features:**
- Batch upload for detail images (all at once)
- Individual upload for logo
- Batch upload for menu images
- Image preview before upload
- Validation:
  - Maximum 10 images per category
  - Maximum 2 MB per image
  - File type validation (images only)

**Implementation Details:**
See `TECHNICAL_DOC_IMAGE_UPLOAD.md` for detailed documentation.

### 3. Booking Management

**Restaurant Bookings** (`BookingsList.js`):
- View all bookings for a restaurant
- Filter and search bookings
- Booking status management

**Create Booking** (`CreateBooking.js`):
- Create new table bookings
- Select date and time
- Guest count selection

### 4. User Authentication

**Admin Login** (`Login.js`):
- Username and password authentication
- Token-based authentication
- Session persistence

**Restaurant Login** (`RestaurantLogin.js`):
- Separate login for restaurant owners
- Restaurant-specific token

**Password Management**:
- Forgot password (`ForgotPassword.js`)
- Reset password (`ResetPassword.js`)
- Update password (`UpdatePassword.js`)

### 5. Responsive Design

- Mobile-first approach
- Tailwind CSS for responsive utilities
- Sidebar navigation for admin
- Responsive forms and tables

---

## Component Documentation

### Core Components

#### `Navbar.js`
- Top navigation bar
- Shows user information
- Logout functionality
- Responsive design

#### `Sidebar.js`
- Left sidebar navigation
- Admin menu items
- Active route highlighting
- Collapsible on mobile

#### `Footer.js`
- Footer with links
- Contact information
- Legal links (Privacy Policy, Terms)

#### `ProtectedRoute.js`
- Route protection for admin routes
- Authentication check
- Redirect to login if not authenticated

#### `RestaurantProtectedRoute.js`
- Route protection for restaurant routes
- Restaurant token check
- Redirect to restaurant login if not authenticated

#### `Toast.js`
- Toast notification system
- Success, error, warning, info types
- Auto-dismiss functionality
- Context provider for global access

**Usage:**
```javascript
import { useToast } from '../components/Toast';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleAction = () => {
    showToast('Operation successful!', 'success');
    // or
    showToast('Error occurred!', 'error');
  };
};
```

#### `TimePicker.js`
- Custom time picker component
- HH:MM format
- Validation support
- Error display

#### `ConfirmationModal.js`
- Reusable confirmation dialog
- Yes/No actions
- Customizable message

---

## Routing

### Route Configuration

Routes are defined in `src/App.js`:

**Public Routes:**
- `/` - Redirects to `/login`
- `/login` - Admin login page
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset
- `/contact` - Contact page
- `/privacy-policy` - Privacy policy
- `/terms-conditions` - Terms and conditions

**Protected Admin Routes:**
- `/dashboard` - Admin dashboard
- `/restaurants` - Restaurant list
- `/restaurants/create` - Create restaurant
- `/restaurants/edit/:id` - Edit restaurant
- `/restaurants/:id` - Restaurant details
- `/update-password` - Update password

**Restaurant Routes:**
- `/restaurant/login` - Restaurant login (public)
- `/restaurant/bookings` - Restaurant bookings (protected)
- `/restaurant/create-booking` - Create booking (protected)

### Navigation

```javascript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/restaurants');
  };
  
  return <button onClick={handleClick}>Go to Restaurants</button>;
};
```

### Link Component

```javascript
import { Link } from 'react-router-dom';

<Link to="/restaurants">View Restaurants</Link>
```

---

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling. Key features:

**Utility Classes:**
```javascript
// Layout
<div className="flex items-center justify-between">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Spacing
<div className="p-4 m-2">
<div className="mt-4 mb-6">

// Colors
<div className="bg-blue-500 text-white">
<div className="border-red-500">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">
```

**Custom Colors:**
The project uses a custom brand color `#ea432b` (red):
```javascript
className="bg-[#ea432b] text-white"
className="border-[#ea432b]"
```

**Forms:**
Tailwind Forms plugin is enabled for better form styling.

### Global Styles

Global styles are in `src/index.css`:
- Tailwind directives
- Custom CSS variables (if any)
- Global resets

---

## State Management

### React Hooks

The project uses React Hooks for state management:

**useState:**
```javascript
const [count, setCount] = useState(0);
const [formData, setFormData] = useState({
  name: '',
  email: '',
});
```

**useEffect:**
```javascript
useEffect(() => {
  // Side effect logic
  fetchData();
}, [dependencies]);
```

**useContext:**
```javascript
const { user, login, logout } = useAuth();
```

### Context API

**AuthContext:**
- Global authentication state
- Login/logout functionality
- User data management

### Local Storage

Used for:
- Token persistence (`token`, `restaurantToken`)
- User data (`user`, `restaurant`)
- Session persistence across page refreshes

---

## Error Handling

### API Error Handling

**Try-Catch Blocks:**
```javascript
try {
  const response = await api.get('/endpoint');
  // Handle success
} catch (error) {
  // Handle error
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response:', error.request);
  } else {
    // Error in request setup
    console.error('Error:', error.message);
  }
}
```

### Form Validation

**Client-Side Validation:**
- Required field checks
- Format validation (email, phone, etc.)
- File size and count validation
- Real-time error display

**Error Display:**
```javascript
{fieldErrors.email && (
  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
)}
```

### Toast Notifications

Use Toast for user feedback:
```javascript
showToast('Success message', 'success');
showToast('Error message', 'error');
showToast('Warning message', 'warning');
showToast('Info message', 'info');
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

Tests are located alongside components:
- `ComponentName.test.js`

### Writing Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  const element = screen.getByText(/expected text/i);
  expect(element).toBeInTheDocument();
});

test('handles user interaction', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  // Assert expected behavior
});
```

---

## Build & Deployment

### Production Build

```bash
# Create production build
npm run build
```

This creates an optimized build in the `build/` directory:
- Minified JavaScript
- Optimized CSS
- Asset optimization
- Source maps (for debugging)

### Build Output

```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
├── manifest.json
└── robots.txt
```

### Deployment Options

#### 1. Static Hosting (Netlify, Vercel, GitHub Pages)

**Netlify:**
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variables in Netlify dashboard

**Vercel:**
1. Import project
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`

#### 2. Traditional Web Server (Apache, Nginx)

1. Build the project: `npm run build`
2. Copy `build/` contents to web server root
3. Configure server to serve `index.html` for all routes
4. Set up environment variables on server

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/darenow-frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
docker build -t darenow-frontend .
docker run -p 80:80 darenow-frontend
```

### Environment Variables in Production

Set environment variables in your hosting platform:
- `REACT_APP_API_BASE_URL` - API endpoint URL
- `REACT_APP_ENV` - Environment (production/development)

**Note:** Environment variables must be prefixed with `REACT_APP_` to be accessible in the React app.

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

#### 2. Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. API Connection Errors

**Error:** `Network Error` or `CORS Error`

**Solutions:**
- Check API server is running
- Verify `REACT_APP_API_BASE_URL` in `.env`
- Check CORS configuration on backend
- Verify network connectivity

#### 4. Build Fails

**Error:** Build errors or warnings

**Solutions:**
- Check for syntax errors
- Verify all imports are correct
- Clear build cache: `rm -rf build`
- Check Node.js version compatibility

#### 5. Authentication Issues

**Symptoms:** Redirect loops, token not persisting

**Solutions:**
- Clear browser localStorage
- Check token format in API response
- Verify API endpoint returns correct token
- Check ProtectedRoute logic

#### 6. Image Upload Issues

**Error:** Images not uploading or validation failing

**Solutions:**
- Check file size (max 2 MB)
- Check file count (max 10 per category)
- Verify API endpoint accepts multipart/form-data
- Check network tab for API errors

### Debugging Tips

1. **Browser DevTools:**
   - Console for errors and logs
   - Network tab for API calls
   - Application tab for localStorage
   - React DevTools for component inspection

2. **Console Logging:**
   ```javascript
   console.log('Debug:', variable);
   console.error('Error:', error);
   ```

3. **React DevTools:**
   - Install React DevTools browser extension
   - Inspect component state and props
   - Profile component performance

4. **Network Inspection:**
   - Check request/response in Network tab
   - Verify headers and payload
   - Check for CORS or authentication errors

---

## Contributing

### Development Workflow

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make Changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

3. **Test Changes:**
   ```bash
   npm test
   npm start  # Manual testing
   ```

4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and Create Pull Request:**
   ```bash
   git push origin feature/feature-name
   ```

### Code Style Guidelines

1. **Component Structure:**
   - Use functional components
   - Use hooks for state and effects
   - Keep components focused and small

2. **Naming Conventions:**
   - Components: PascalCase
   - Functions: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Files: Match component/function name

3. **Code Organization:**
   - Group related code together
   - Extract reusable logic to utilities
   - Use meaningful variable names

4. **Comments:**
   - Comment complex logic
   - Document function parameters
   - Explain "why" not "what"

### Pull Request Guidelines

- Clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

---

## Additional Resources

### Documentation Links

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)
- [Create React App Documentation](https://create-react-app.dev/)

### Project-Specific Documentation

- `TECHNICAL_DOC_IMAGE_UPLOAD.md` - Image upload feature documentation
- `README.md` - Basic project information

### Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Contact the development team

---

## Version Information

- **React:** 19.2.0
- **React Router:** 7.9.4
- **Axios:** 1.12.2
- **Tailwind CSS:** 3.4.18
- **Create React App:** 5.0.1
- **Node.js:** Recommended v14.0.0 or higher

---

## License

[Add license information here]

---

**Last Updated:** [Current Date]
**Document Version:** 1.0

