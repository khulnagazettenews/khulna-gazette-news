'use client';

export default function FacebookWidget() {
  const facebookUrl = "https://www.facebook.com/klngazette";

  return (
    <div className="bg-white rounded-md border border-slate-200 p-3 space-y-3.5">
      {/* 1. Header banner */}
      <div className="bg-[#2d3748] text-white py-2.5 px-4 text-center font-bold text-[14px] leading-tight rounded-t-sm select-none">
        Like Us on Facebook
      </div>

      {/* 2. Mock Facebook Page Plugin Box */}
      <div className="border border-[#dddfe2] rounded-sm bg-white overflow-hidden shadow-2xs font-sans">
        {/* Cover Photo Area */}
        <div className="h-[74px] bg-white relative border-b border-[#dddfe2]">
          {/* Circular Logo with blue ring border */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-[10px] top-[10px] w-[50px] h-[50px] rounded-full bg-white border-2 border-[#1877f2] flex items-center justify-center p-[2px] shadow-xs hover:scale-[1.02] transition"
          >
            <img
              src="/favicon.png"
              alt="Khulna Gazette News"
              className="w-full h-full rounded-full object-contain select-none"
            />
          </a>
        </div>

        {/* Page Info Area */}
        <div className="p-3 pt-3.5 space-y-1">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-bold text-[#365899] hover:underline block leading-snug"
          >
            Khulna Gazette News
          </a>
          <div className="text-[11px] text-[#616770] font-semibold select-none leading-none pb-1">
            171,520 followers
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-[#f5f6f7] border-t border-[#e5e5e5] px-3 py-2 flex items-center justify-between select-none">
          {/* Follow Page Button */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-[#ebedf0] border border-[#ccd0d5] rounded-[2px] text-[11px] font-bold text-[#4b4f56] py-1 px-2.5 flex items-center gap-1.5 transition shadow-2xs"
          >
            {/* Facebook small 'f' logo */}
            <svg className="w-3.5 h-3.5 fill-[#1877f2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Follow Page
          </a>

          {/* Share Button */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-[#ebedf0] border border-[#ccd0d5] rounded-[2px] text-[11px] font-bold text-[#4b4f56] py-1 px-2.5 flex items-center gap-1.5 transition shadow-2xs"
          >
            {/* Share arrow icon */}
            <svg className="w-3.5 h-3.5 fill-[#616770]" viewBox="0 0 24 24">
              <path d="M21 11.25l-7.5-7.5v4.5C6 9 3 15.75 3 20.25c2.25-3.75 6-4.5 10.5-4.5v4.5l7.5-7.5z" />
            </svg>
            Share
          </a>
        </div>
      </div>
    </div>
  );
}
