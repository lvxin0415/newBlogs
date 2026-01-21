'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    '快速链接': [
      { label: '首页', href: '/' },
      { label: '文章', href: '/#articles' },
      { label: '分类', href: '/categories' },
      { label: '标签', href: '/tags' },
    ],
    '关于': [
      { label: '关于我们', href: '/about' },
      { label: '联系方式', href: '/about#contact' },
      { label: '隐私政策', href: '/privacy' },
      { label: '使用条款', href: '/terms' },
    ],
    '资源': [
      { label: '技术文档', href: '/docs' },
      { label: '学习路线', href: '/roadmap' },
      { label: 'RSS 订阅', href: '/rss.xml' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: 'github', href: '#' },
    { name: 'Twitter', icon: 'twitter', href: '#' },
    { name: 'Email', icon: 'email', href: '#' },
  ];

  return (
    <footer className="relative mt-20 pt-20 pb-10 px-4 border-t border-border-color">
      {/* 装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-secondary/30 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 主要内容 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo 和简介 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                {/* Logo */}
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg transform rotate-45" />
                  <div className="absolute inset-1 bg-bg-primary rounded-lg transform rotate-45" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-primary font-display font-bold text-2xl">T</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold gradient-text">
                    TECH INSIGHTS
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                探索前端、后端、Web3 和人工智能的前沿技术。
                分享经验，记录成长，创造价值。
              </p>
              
              {/* 社交链接 */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 glass-card rounded-lg flex items-center justify-center hover:border-primary transition-all group"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5 text-text-tertiary group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      {social.icon === 'github' && (
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      )}
                      {social.icon === 'twitter' && (
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      )}
                      {social.icon === 'email' && (
                        <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 链接分组 */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-primary group-hover:w-4 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-border-color to-transparent mb-8" />

        {/* 底部信息 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
          <p className="font-mono">
            © {currentYear} Tech Insights. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              Made with
              <span className="text-accent animate-pulse">❤️</span>
              by Tech Insights Team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
