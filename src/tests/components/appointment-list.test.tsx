import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppointmentList } from "@/app/(dashboard)/dashboard/appointments/appointment-list";
import type { Appointment, Service, AppointmentStatus } from "@prisma/client";

vi.mock(
  "@/app/(dashboard)/dashboard/appointments/actions",
  () => ({
    updateAppointmentStatus: vi.fn().mockResolvedValue({ success: true }),
  })
);

const mockService: Service = {
  id: "s1",
  tenantId: "t1",
  name: "Consultation",
  description: null,
  category: null,
  duration: 30,
  price: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeAppointment(
  status: AppointmentStatus = "CONFIRMED",
  daysFromNow = 7
): Appointment & { service: Service } {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    id: "a1",
    tenantId: "t1",
    serviceId: "s1",
    service: mockService,
    clientName: "Jane Doe",
    clientEmail: "jane@example.com",
    clientPhone: null,
    startTime: start,
    endTime: end,
    status,
    notes: null,
    reminderSent: false,
    cancelledAt: null,
    cancelReason: null,
    cancelToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("AppointmentList — empty states", () => {
  it("shows upcoming empty state when list is empty", () => {
    render(<AppointmentList appointments={[]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText(/No upcoming appointments/i)).toBeInTheDocument();
  });

  it("shows past empty state when list is empty", () => {
    render(<AppointmentList appointments={[]} type="past" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText(/No past appointments/i)).toBeInTheDocument();
  });
});

describe("AppointmentList — card content", () => {
  it("renders service name and client name", () => {
    render(<AppointmentList appointments={[makeAppointment()]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders the client email", () => {
    render(<AppointmentList appointments={[makeAppointment()]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows a human-readable status badge (Confirmed)", () => {
    render(<AppointmentList appointments={[makeAppointment("CONFIRMED")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("shows Pending badge", () => {
    render(<AppointmentList appointments={[makeAppointment("PENDING")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows Cancelled badge", () => {
    render(<AppointmentList appointments={[makeAppointment("CANCELLED")]} type="past" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders notes with message icon when present", () => {
    const apt = { ...makeAppointment(), notes: "Please bring your portfolio" };
    render(<AppointmentList appointments={[apt]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Please bring your portfolio")).toBeInTheDocument();
  });
});

describe("AppointmentList — action buttons", () => {
  it("shows Complete and Cancel buttons for CONFIRMED upcoming", () => {
    render(<AppointmentList appointments={[makeAppointment("CONFIRMED")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows Confirm button for PENDING upcoming", () => {
    render(<AppointmentList appointments={[makeAppointment("PENDING")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("hides action buttons for past appointments", () => {
    render(<AppointmentList appointments={[makeAppointment("CONFIRMED")]} type="past" use24Hour={false} timeZone="UTC" />);
    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("hides action buttons for cancelled appointments", () => {
    render(<AppointmentList appointments={[makeAppointment("CANCELLED")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("calls updateAppointmentStatus when Confirm is clicked", async () => {
    const { updateAppointmentStatus } = await import(
      "@/app/(dashboard)/dashboard/appointments/actions"
    );
    render(<AppointmentList appointments={[makeAppointment("PENDING")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(updateAppointmentStatus).toHaveBeenCalledWith("a1", "CONFIRMED");
    });
  });

  it("calls updateAppointmentStatus when Cancel is clicked", async () => {
    const { updateAppointmentStatus } = await import(
      "@/app/(dashboard)/dashboard/appointments/actions"
    );
    render(<AppointmentList appointments={[makeAppointment("CONFIRMED")]} type="upcoming" use24Hour={false} timeZone="UTC" />);
    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(updateAppointmentStatus).toHaveBeenCalledWith("a1", "CANCELLED");
    });
  });
});
