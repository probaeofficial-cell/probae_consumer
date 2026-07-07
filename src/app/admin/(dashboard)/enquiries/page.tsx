"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Eye, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  filters: {
    duration: string;
    frequency: string;
    mealSlots: string[];
    calorieTarget?: number;
  };
  status: "Pending" | "Resolved";
  createdAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResolved = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved" })
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: "Resolved" } : e));
      }
    } catch (error) {
      console.error("Failed to resolve enquiry", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      {/* Top Action Bar */}
      <div className="p-6 md:p-8 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 bg-white z-10 relative">
        <div>
          <h2 className="text-xl font-bold font-headline text-gray-900">Enquiries</h2>
          <p className="text-sm text-gray-500 mt-1">Manage connect requests from users who didn't find a matching plan.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50/30 p-6 md:p-8 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm text-gray-500 font-medium">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No pending enquiries at the moment.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">User Details</th>
                    <th className="px-6 py-4 font-semibold">Requirement</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{enq.name}</span>
                          <span className="text-sm text-gray-500 font-mono mt-0.5">{enq.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                           <div className="flex flex-wrap gap-1">
                             <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{enq.filters.frequency}</span>
                             <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{enq.filters.duration}</span>
                           </div>
                           <div className="text-xs text-gray-500 mt-1">
                             {enq.filters.calorieTarget ? `${enq.filters.calorieTarget} kcal` : "Custom"} • {enq.filters.mealSlots.join(", ")}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(enq.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                          enq.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        }`}>
                          {enq.status === "Pending" ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {enq.status === "Pending" ? (
                          <Button 
                            variant="primary" 
                            isLoading={updatingId === enq._id}
                            onClick={() => markAsResolved(enq._id)}
                            className="text-xs px-3 py-1.5 h-auto rounded-lg shadow-sm font-medium"
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <span className="text-sm font-medium text-gray-400 italic">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
