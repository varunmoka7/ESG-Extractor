# ESG Metrics Extractor

A powerful web application for extracting and analyzing ESG (Environmental, Social, and Governance) metrics from sustainability reports using AI-powered text analysis.

## Features

- **Multi-Sector Support**: Specialized extractors for Apparel, Banking, and Waste Management sectors
- **AI-Powered Analysis**: Uses Google Gemini AI for intelligent text extraction and analysis
- **KPI Dashboard**: Visual display of extracted ESG metrics with performance indicators
- **CSV Export**: Export extracted data for further analysis
- **Responsive Design**: Modern, mobile-friendly interface
- **Dark/Light Theme**: Toggle between themes for better user experience

## Supported ESG Metrics

### Apparel Sector
- Carbon footprint per product
- Water usage in manufacturing
- Sustainable material usage
- Labor standards compliance
- Supply chain transparency

### Banking Sector
- Green financing portfolio
- Carbon footprint of operations
- ESG risk assessment
- Sustainable investment products
- Community development initiatives

### Waste Management
- Waste diversion rates
- Recycling efficiency
- Carbon emissions reduction
- Circular economy initiatives
- Environmental compliance

## Prerequisites

- Node.js (v16 or higher)
- Google Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/varunmoka7/ESG-Extractor.git
   cd ESG-Extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Select Sector**: Choose the appropriate sector (Apparel, Banking, or Waste Management)
2. **Input Report**: Paste or upload your sustainability report text
3. **Extract Metrics**: Click "Extract ESG Metrics" to analyze the report
4. **Review Results**: View extracted KPIs and performance indicators
5. **Export Data**: Download results as CSV for further analysis

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with modern design principles
- **AI Integration**: Google Gemini API
- **State Management**: React Context API

## Project Structure

```
esg-metrics-extractor/
├── components/          # React components
│   ├── KpiDisplay.tsx   # KPI visualization components
│   ├── ReportInput.tsx  # Report input interface
│   └── ...             # Sector-specific components
├── contexts/           # React context providers
├── services/           # API services
├── utils/              # Utility functions
├── types.ts           # TypeScript type definitions
└── constants.ts       # Application constants
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Add more industry sectors
- [ ] Implement batch processing for multiple reports
- [ ] Add historical trend analysis
- [ ] Integrate with sustainability reporting frameworks
- [ ] Add data validation and quality checks
