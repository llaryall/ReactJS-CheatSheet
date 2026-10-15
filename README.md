A comprehensive and interactive cheatsheet for ReactJS concepts, built with Next.js, Tailwind CSS, and PocketBase. This application provides a quick reference for React developers of all levels, from beginners to advanced users.

**Live Demo:** [ReactJSCheatSheet](https://llaryall.github.io/ReactJS-CheatSheet/)

**Features**
  - **Categorized Topics:** React concepts are organized into logical categories for easy navigation.
  - **Tiered Difficulty:** Topics are marked with tiers (🟢 Beginner, 🔵 Common Use, 🟣 Advanced) to help users focus on relevant material.
  - **Interactive UI:**
     - Collapsible category cards with smooth animations (Framer Motion).
     - Pagination within categories for different tiers of topics.
     - Clickable topics open a modal with detailed descriptions and code examples.
  - **Search Functionality:** Quickly find specific topics across all categories.
  - **Responsive Design:** Works well on desktop, tablet, and mobile devices.
  - **Dark Mode:** Switch between light and dark themes for comfortable viewing.
  - **Syntax Highlighting:** Code examples within topic descriptions are clearly highlighted.
  - **Static Export:** Optimized for static hosting platforms like Vercel, ensuring fast load times.

**Tech Stack**
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (for animations)
- [html-react-parser](https://github.com/remarkablemark/html-react-parser) (for rendering HTML content from descriptions)
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (for code block styling)

**Data Source (Build Time):**
- [PocketBase](https://pocketbase.io/) – Used as a headless CMS to store categories and topics. Data is fetched at build time to generate a static site.

**Project Structure**

```
reactcheatsheet/
├── app/                      # Next.js App Router (pages, layout, API routes if any)
│   ├── page.js               # Main homepage component (Server Component)
│   ├── layout.js             # Root layout
│   └── globals.css           # Global styles
├── components/               # Reusable React components
│   ├── InteractiveCategoryList.jsx
│   ├── SearchedTopicItem.jsx
│   ├── TopicBrowser.jsx
│   ├── TopicModal.jsx
│   └── topicActions.js       # Server Action for fetching topic details (used during static export)
├── lib/                      # Utility functions, PocketBase client setup
│   └── pocketbase.js
├── public/                   # Static assets (images, favicons)
├── .env.example              # Example environment variables
├── next.config.mjs           # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json
└── README.md
```


**Contributing**

Contributions are welcome! If you have suggestions for new topics, improvements to existing content, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License.
