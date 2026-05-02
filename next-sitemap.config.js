/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://transiteducation.com.np',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*'],
}
