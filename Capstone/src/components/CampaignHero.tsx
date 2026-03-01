import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const CampaignHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-emerald-500 to-green-600 text-white py-24 px-6 md:px-12">
      
      {/* Glow background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-400/30 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/30 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* LEFT CONTENT */}
          <div className="md:w-1/2 text-center md:text-left">
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              The New Pulse of <span className="text-[#14F195]">Web3</span> Crowdfunding
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl mx-auto md:mx-0">
              Decentralized, transparent, and built for the community. Support dreamers or launch your own vision with instant settlements and liquid staking yields.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              
              <Link
                href="/account"
                className="relative group bg-white text-emerald-600 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="relative z-10">Explore Campaigns</span>
                <div className="absolute inset-0 bg-emerald-100 opacity-0 group-hover:opacity-100 rounded-xl transition duration-300" />
              </Link>

              <Link
                href="/create"
                className="bg-emerald-700 hover:bg-emerald-800 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 backdrop-blur-sm"
              >
                Start a Campaign
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
                <p className="text-xl md:text-3xl font-bold">1%</p>
                <p className="text-xs text-white/70 mt-1 tracking-wide uppercase">Platform Fees</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
                <p className="text-xl md:text-3xl font-bold">100%</p>
                <p className="text-xs text-white/70 mt-1 tracking-wide uppercase">On-Chain</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
                <p className="text-xl md:text-3xl font-bold text-[#14F195]">Jito</p>
                <p className="text-xs text-white/70 mt-1 tracking-wide uppercase">Yield Backed</p>
              </div>

            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="md:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <Image
                src="https://images.unsplash.com/photo-1537968990071-e569894be163?w=600&auto=format&fit=crop&q=60"
                alt="Crowdfunding Illustration"
                width={576}
                height={384}
                className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default CampaignHero