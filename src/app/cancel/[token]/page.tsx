import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CancelConfirm } from "./cancel-confirm";
import { formatTime } from "@/lib/format-time";

export default async function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      clientName: true,
      startTime: true,
      endTime: true,
      status: true,
      service: { select: { name: true, duration: true } },
      tenant: { select: { businessName: true, primaryColor: true, use24Hour: true } },
    },
  });

  if (!appointment) notFound();

  const formattedDate = appointment.startTime.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = formatTime(appointment.startTime, appointment.tenant.use24Hour);
  const hoursUntil = (appointment.startTime.getTime() - Date.now()) / 3_600_000;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <CancelConfirm
        token={token}
        status={appointment.status}
        clientName={appointment.clientName}
        serviceName={appointment.service.name}
        businessName={appointment.tenant.businessName}
        primaryColor={appointment.tenant.primaryColor}
        date={formattedDate}
        time={formattedTime}
        tooLate={hoursUntil < 1}
      />
    </div>
  );
}
