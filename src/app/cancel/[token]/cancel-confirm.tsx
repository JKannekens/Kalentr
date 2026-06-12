"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelByToken } from "./actions";
import { CalendarX2, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

interface Props {
  token: string;
  status: string;
  clientName: string;
  serviceName: string;
  businessName: string;
  primaryColor: string;
  date: string;
  time: string;
  tooLate: boolean;
}

export function CancelConfirm({
  token, status, clientName, serviceName, businessName, primaryColor, date, time, tooLate,
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "CANCELLED") {
    return <StatusCard icon={<CheckCircle2 className="h-8 w-8 text-gray-400" />} title="Already cancelled" body="This appointment has already been cancelled." />;
  }
  if (status === "COMPLETED") {
    return <StatusCard icon={<AlertCircle className="h-8 w-8 text-gray-400" />} title="Can't cancel" body="This appointment has already been completed." />;
  }
  if (tooLate) {
    return <StatusCard icon={<Clock className="h-8 w-8 text-amber-500" />} title="Too late to cancel" body="Appointments can't be cancelled less than 1 hour before the start time. Please contact the business directly." />;
  }
  if (state === "done") {
    return <StatusCard icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" />} title="Appointment cancelled" body={`Your ${serviceName} on ${date} at ${time} has been cancelled. A confirmation has been sent to your email.`} />;
  }

  async function handleCancel() {
    setState("loading");
    const result = await cancelByToken(token);
    if (result.success) {
      setState("done");
    } else {
      setErrorMsg(result.error || "Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white shadow-lg overflow-hidden">
      <div className="h-2" style={{ backgroundColor: primaryColor }} />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}20` }}>
            <CalendarX2 className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Cancel appointment</p>
            <p className="text-sm text-gray-500">{businessName}</p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6 space-y-2">
          <p className="text-sm"><span className="text-gray-500">Client:</span> <span className="font-medium text-gray-900">{clientName}</span></p>
          <p className="text-sm"><span className="text-gray-500">Service:</span> <span className="font-medium text-gray-900">{serviceName}</span></p>
          <p className="text-sm"><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{date}</span></p>
          <p className="text-sm"><span className="text-gray-500">Time:</span> <span className="font-medium text-gray-900">{time}</span></p>
        </div>

        {state === "error" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-5">
          Are you sure you want to cancel this appointment? This cannot be undone.
        </p>

        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleCancel}
            disabled={state === "loading"}
          >
            {state === "loading" ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Cancelling…</> : "Yes, cancel it"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => history.back()}>
            Keep it
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-white shadow-lg p-8 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{body}</p>
    </div>
  );
}
