export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-display font-bold mb-6">
            <span className="gradient-text">关于本站</span>
          </h1>
          <p className="text-xl text-slate-400">
            一个记录技术成长的个人博客
          </p>
        </div>

        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-3xl font-display font-bold mb-4">简介</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              欢迎来到我的技术博客！这里记录了我在前端、后端和 Web3
              开发过程中的学习笔记、踩坑经验和技术思考。
            </p>
            <p className="text-slate-300 leading-relaxed">
              博客采用 Next.js 14 + React 18 + Tailwind CSS
              构建，后端使用 Node.js + Express + MySQL，提供流畅的阅读体验和强大的管理功能。
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-3xl font-display font-bold mb-4">技术栈</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Next.js 14', color: 'from-blue-500 to-cyan-500' },
                { name: 'React 18', color: 'from-cyan-500 to-blue-500' },
                { name: 'TypeScript', color: 'from-blue-600 to-purple-600' },
                { name: 'Tailwind CSS', color: 'from-teal-500 to-cyan-500' },
                { name: 'Node.js', color: 'from-green-500 to-emerald-500' },
                { name: 'Express', color: 'from-gray-600 to-gray-500' },
                { name: 'MySQL', color: 'from-orange-500 to-yellow-500' },
                { name: 'Sequelize', color: 'from-blue-500 to-indigo-500' },
                { name: 'JWT', color: 'from-purple-500 to-pink-500' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="group relative bg-slate-800/50 rounded-lg px-4 py-3 text-center hover:bg-slate-700/50 transition-all cursor-pointer overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <span className="relative z-10">{tech.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-3xl font-display font-bold mb-4">联系方式</h2>
            <div className="space-y-4 text-slate-300">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold group-hover:text-blue-400 transition-colors">GitHub</p>
                  <p className="text-sm text-slate-500">查看我的开源项目</p>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold group-hover:text-blue-400 transition-colors">Twitter</p>
                  <p className="text-sm text-slate-500">关注我的技术动态</p>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="mailto:admin@example.com"
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold group-hover:text-blue-400 transition-colors">Email</p>
                  <p className="text-sm text-slate-500">admin@example.com</p>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
