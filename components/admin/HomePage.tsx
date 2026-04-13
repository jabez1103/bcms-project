// components/admin/HomeContent.tsx
export default function HomeContent() {
  return (
    <div>
      <div className="flex sm:w-auto">

        {/*FIrst form*/}
        <div className=" sm:w-130 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500  p-5">
          <div className=" flex items-center justify-between">
            <h3 className=" px-0.8 font-bold text-gray-900">
              Requirements Status
            </h3>

            <span className="text-xs font-bold text-gray-400">
              Updated 2 hours ago
            </span>
          </div>
          <p className="font-normal text-gray-500 text-sm mb-5">
            Distribution across deprtments
          </p>
          <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ">
            <div className="px-6 py-25 border-b border-gray-50 text-black font-normal flex items-center justify-between ">
            <p>Graph ari</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center ">
          <div className="sm:w-auto px-5 py-5 border border-gray-50 font-normal text-gray-500 text-center rounded-xl mx-4 mb-4 shadow-sm">
            <p>Cleared</p>
          </div>   
           <div className="sm:w-auto px-5 py-5 border border-gray-50 font-normal text-gray-500 text-center rounded-xl mx-4 mb-4 shadow-sm">
            <p>Cleared</p>
          </div>   
        </div>

        <div className="sm:w-auto px-5 py-5 border border-gray-50 font-normal text-gray-500 text-center rounded-xl mx-4 mb-4 shadow-sm">
            <p>Filter</p>
          </div>   
      </div>


       {/*Table ni*/}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden mt-5">
        <div className="text-black px-12 mt-5">
          <div className="font-bold">
            <h1>Overview</h1>
          </div>
          <p className="text-sm text-gray-500">
            {" "}
            Student records and clearance status
          </p>
        </div>   
        <div className="top-0 z-30 bg-white border-b border-slate-100 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between ">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-2 00 ">
                <th className="px-6 py-4 font-black">Student</th>
                <th className="px-6 py-4 font-black">Level</th>
                <th className="px-6 py-4 font-black">Program</th>
                <th className="px-6 py-4 font-black">Clearance Status</th>
                <th className="px-6 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
