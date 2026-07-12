const Sidebar = ({ info }) => (
  <div className="flex flex-col gap-6">
    <div className="bg-orange-50/50 p-5 sm:p-6 rounded-2xl border border-orange-100 text-sm text-gray-700 italic relative">
      <span className="text-3xl sm:text-4xl text-orange-200 font-serif absolute top-2 left-3 leading-none">"</span>
      <p className="relative z-10 pl-4">{info.quote}</p>
      <span className="text-3xl sm:text-4xl text-orange-200 font-serif absolute bottom-[-16px] right-4 leading-none">"</span>
    </div>

    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-3">About Me</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{info.bio}</p>
      
      <div className="flex flex-col gap-4">
        {info.details.map((detail, idx) => {
          const Icon = detail.icon;
          return (
            <div key={idx} className="flex gap-3 items-start">
              <Icon className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{detail.label}</p>
                {detail.link ? (
                  <a href={detail.link} className="text-sm text-gray-900 font-medium hover:text-orange-500 transition-colors break-all">{detail.value}</a>
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{detail.value}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>

  </div>
);

export default Sidebar;
