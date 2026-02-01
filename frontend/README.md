# Authentica - NFT-based Digital Product Passport & Verification System

A modern React-based frontend for authenticating and tracking products using NFT-based digital passports.

## Features

### Admin Dashboard
- **Product Registration**: Comprehensive form for registering new products with detailed information
- **Asset Management**: Upload and manage product assets (images, documents)
- **Passport Minting**: Create NFT-based digital passports with QR codes
- **Provenance Timeline**: Track complete product history and journey
- **Analytics Dashboard**: Overview of verification statistics and recent activities

### Consumer Verification
- **QR Code Scanning**: Camera-based QR code scanning
- **File Upload**: Upload QR code images for verification
- **Manual Input**: Enter Tag ID manually
- **Verification Results**: Clear AUTHENTIC/TAMPERED/FAKE status display
- **Product History**: View complete provenance information

## Tech Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── StatusBadge.jsx
│   ├── LoadingSpinner.jsx
│   └── Layout.jsx
├── pages/              # Page components
│   ├── AdminDashboard.jsx
│   ├── ProductRegistration.jsx
│   ├── AssetsUpload.jsx
│   ├── MintPassport.jsx
│   ├── ProvenanceTimeline.jsx
│   ├── ScanPage.jsx
│   └── VerificationResult.jsx
├── services/           # API service layer
│   └── api.js
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.jsx             # Main app component with routing
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd authentica
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## UI/UX Design

### Design Principles
- **Trust-Focused**: Clean, professional interface that inspires confidence
- **Status Colors**: 
  - Green (#22c55e) for AUTHENTIC products
  - Yellow (#f59e0b) for TAMPERED products  
  - Red (#ef4444) for FAKE products
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: Semantic HTML and ARIA labels where appropriate

### Component System
- **Reusable Components**: Modular UI components for consistency
- **Status Badges**: Visual indicators for product verification status
- **Loading States**: Proper loading indicators for better UX
- **Error Handling**: User-friendly error messages and recovery options

## API Integration

The application is designed to work with REST APIs. The API service layer is configured in `src/services/api.js`:

### Available Endpoints
- `GET /products` - List all products
- `POST /products` - Create new product
- `POST /assets/upload` - Upload product assets
- `POST /passports/mint` - Mint NFT passport
- `POST /verify` - Verify product authenticity
- `GET /provenance/{id}/timeline` - Get product history

### Configuration
Update the `API_BASE_URL` in `src/services/api.js` to point to your backend API.

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=https://your-api-domain.com
VITE_API_KEY=your-api-key
```

## Features Breakdown

### Admin Dashboard
- Real-time statistics (total, authentic, tampered, fake products)
- Recent product activity feed
- Quick action buttons for common tasks
- Navigation to all admin functions

### Product Registration
- Multi-step form with validation
- Support for detailed product information
- Category-based organization
- Serial number tracking

### Asset Upload
- Drag and drop file upload
- Image preview functionality
- Multiple file type support
- Upload progress tracking

### Passport Minting
- Product selection interface
- Automatic Tag ID generation
- QR code generation
- Download and print functionality

### Provenance Timeline
- Chronological event display
- Detailed metadata for each event
- Location and actor tracking
- Status indicators

### Consumer Verification
- Multiple scan methods
- Real-time verification feedback
- Detailed product information
- Trust indicators

## Security Considerations

- Input validation on all forms
- XSS prevention through React's built-in protections
- Secure API communication with HTTPS
- Authentication token management
- Error handling without information leakage

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of components
- Image optimization
- Efficient state management
- Bundle size optimization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the development team.
