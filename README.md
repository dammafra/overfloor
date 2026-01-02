# Overfloor

![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Three.js](https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

> Try it live here 👉 [overfloor.dammafra.dev](https://overfloor.dammafra.dev)

Watch the floor tiles, be careful where you stand, outlast your opponents and be the last one standing!

<img src="./client/public/cover.png" alt="Cover"  >

## Technologies Used

- [React](https://react.dev/)
- [Typescript](https://www.typescriptlang.org/)
- [Tailwind](https://tailwindcss.com/)
- [@react-three/fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [@react-three/drei](https://drei.docs.pmnd.rs/getting-started/introduction)
- [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- [@react-spring](https://www.react-spring.dev/)
- [zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [use-sound](https://github.com/joshwcomeau/use-sound?tab=readme-ov-file)

## Setup

The repository contains two separate projects:

- **client** - React application in Typescript
- **server** - Colyseus application in Node

```bash
# Create client and server .env files
cp client/.env.example client/.env && cp server/.env.example server/.env

# Install dependencies (only the first time)
npm install

# Run the local server at localhost:5173 and localhost:2567 for client and server respectively
npm run dev

# Build for production in the client/dist and server/dist directories
npm run build
```

## Features

TBD

### Mobile-Friendly

The game is optimized for mobile devices, providing a smooth and engaging experience on smartphones and tablets. It adapts to smaller screens, ensuring easy interaction and navigation on touch interfaces.

## Credits

Check out the credits section in the project for a full list of resources used.

## Feedback

If you have any suggestions, feel free to reach out!

## License

© 2025 Francesco Dammacco  
This project is licensed under the GNU Affero General Public License v3.0.  
See the [LICENSE](./LICENSE) file for details.
