/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: isProd ? 'ReactJS-CheatSheet' : '',
    assetPrefix: isProd ? 'ReactJS-CheatSheet' : '',
    
}

export default nextConfig;
