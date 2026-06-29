/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://transiteducation.com.np',
  generateRobotsTxt: true,
  exclude: [
    '/admin',
    '/admin/*',
    '/cms',
    '/cms/*',
    '/cms/login',
    '/cms/blog',
    '/cms/blog/new',
  ],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/cms', '/cms/', '/admin', '/admin/'] },
    ],
  },
}
