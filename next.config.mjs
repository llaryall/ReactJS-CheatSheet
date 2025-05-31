/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// IMPORTANT: Make sure 'ReactJS-CheatSheet' is your actual GitHub repository name!
const repositoryName = 'ReactJS-CheatSheet'; 

const nextConfig = {
    output: 'export',
    basePath: isProd ? `/${repositoryName}` : '',
    assetPrefix: isProd ? `/${repositoryName}/` : '',
    images: {
        unoptimized: true, // Good for static exports, especially for GitHub Pages
    },
}

export default nextConfig;
