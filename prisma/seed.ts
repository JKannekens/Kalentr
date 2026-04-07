import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean up existing seed data
  await prisma.appointment.deleteMany({});
  await prisma.timeOff.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.bookingConfig.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.user.deleteMany({ where: { email: "demo@kalentr.com" } });

  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "demo@kalentr.com",
      password: passwordHash,
      isVerified: true,
      emailVerified: new Date(),
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      subdomain: "alexmorgan",
      businessName: "Alex Morgan Design",
      description:
        "Freelance UI/UX designer and web developer. I help startups and small businesses craft beautiful, user-friendly digital products.",
      primaryColor: "#6366f1",
      timezone: "Europe/Amsterdam",
      ownerId: user.id,
    },
  });

  await prisma.bookingConfig.create({
    data: {
      tenantId: tenant.id,
      minAdvanceHours: 2,
      maxAdvanceDays: 60,
      slotDurationMinutes: 30,
      bufferMinutes: 15,
    },
  });

  // Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "Design Consultation",
        description:
          "A focused 30-minute session to discuss your design needs, review existing work, or brainstorm ideas.",
        category: "Consultation",
        duration: 30,
        price: 5000,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "UX Audit",
        description:
          "In-depth review of your product's user experience with actionable recommendations.",
        category: "Audit",
        duration: 90,
        price: 15000,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "Website Strategy Session",
        description:
          "60-minute deep-dive to plan your website architecture, content, and conversion goals.",
        category: "Strategy",
        duration: 60,
        price: 10000,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "Brand Identity Review",
        description:
          "Review and feedback on your brand colors, typography, logo, and overall visual identity.",
        category: "Audit",
        duration: 45,
        price: 7500,
        isActive: true,
      },
    }),
  ]);

  // Weekly availability: Mon–Fri, 09:00–17:00
  const workDays = [1, 2, 3, 4, 5]; // Mon to Fri
  await Promise.all(
    workDays.map((day) =>
      prisma.availability.create({
        data: {
          tenantId: tenant.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true,
        },
      }),
    ),
  );

  // Time off: a week's holiday in the near future
  await prisma.timeOff.create({
    data: {
      tenantId: tenant.id,
      startDate: new Date("2026-04-14T00:00:00.000Z"),
      endDate: new Date("2026-04-18T23:59:59.000Z"),
      label: "Spring Holiday",
    },
  });

  // Appointments spread across the past month and upcoming weeks
  const appointmentData: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceIndex: number;
    startOffset: number; // days from today
    startHour: number;
    status: AppointmentStatus;
    notes?: string;
  }[] = [
    {
      clientName: "Sarah Chen",
      clientEmail: "sarah.chen@example.com",
      clientPhone: "+31 6 12345678",
      serviceIndex: 0,
      startOffset: -20,
      startHour: 10,
      status: "COMPLETED",
    },
    {
      clientName: "Marcus Webb",
      clientEmail: "marcus.webb@example.com",
      serviceIndex: 2,
      startOffset: -14,
      startHour: 14,
      status: "COMPLETED",
      notes: "Focused on e-commerce redesign.",
    },
    {
      clientName: "Priya Sharma",
      clientEmail: "priya.sharma@example.com",
      clientPhone: "+31 6 87654321",
      serviceIndex: 1,
      startOffset: -10,
      startHour: 9,
      status: "COMPLETED",
    },
    {
      clientName: "Tom Fischer",
      clientEmail: "tom.fischer@example.com",
      serviceIndex: 3,
      startOffset: -7,
      startHour: 11,
      status: "CANCELLED",
      notes: "Client rescheduled.",
    },
    {
      clientName: "Laura Knight",
      clientEmail: "laura.knight@example.com",
      serviceIndex: 0,
      startOffset: -3,
      startHour: 15,
      status: "COMPLETED",
    },
    {
      clientName: "Daniel Park",
      clientEmail: "daniel.park@example.com",
      serviceIndex: 2,
      startOffset: -1,
      startHour: 10,
      status: "NO_SHOW",
    },
    {
      clientName: "Emma Johansson",
      clientEmail: "emma.j@example.com",
      clientPhone: "+46 70 1234567",
      serviceIndex: 0,
      startOffset: 1,
      startHour: 9,
      status: "CONFIRMED",
    },
    {
      clientName: "James Rivera",
      clientEmail: "j.rivera@example.com",
      serviceIndex: 1,
      startOffset: 2,
      startHour: 13,
      status: "CONFIRMED",
      notes: "Review the mobile app flows.",
    },
    {
      clientName: "Nina Volkov",
      clientEmail: "nina.volkov@example.com",
      serviceIndex: 3,
      startOffset: 5,
      startHour: 10,
      status: "PENDING",
    },
    {
      clientName: "Chris Adeyemi",
      clientEmail: "c.adeyemi@example.com",
      clientPhone: "+234 800 1234567",
      serviceIndex: 2,
      startOffset: 7,
      startHour: 14,
      status: "PENDING",
    },
    {
      clientName: "Sophie Laurent",
      clientEmail: "sophie.laurent@example.com",
      serviceIndex: 0,
      startOffset: 10,
      startHour: 11,
      status: "PENDING",
    },
    {
      clientName: "Oliver Mäkinen",
      clientEmail: "oliver.m@example.com",
      serviceIndex: 1,
      startOffset: 12,
      startHour: 9,
      status: "PENDING",
      notes: "Wants focus on onboarding flow.",
    },
  ];

  const today = new Date("2026-04-07T00:00:00.000Z");

  await Promise.all(
    appointmentData.map(async (appt) => {
      const service = services[appt.serviceIndex];
      const start = new Date(today);
      start.setDate(start.getDate() + appt.startOffset);
      start.setHours(appt.startHour, 0, 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + service.duration);

      return prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          serviceId: service.id,
          clientName: appt.clientName,
          clientEmail: appt.clientEmail,
          clientPhone: appt.clientPhone,
          startTime: start,
          endTime: end,
          status: appt.status,
          notes: appt.notes,
          reminderSent:
            appt.status === "COMPLETED" || appt.status === "CONFIRMED",
          cancelledAt:
            appt.status === "CANCELLED"
              ? new Date(start.getTime() - 86400000)
              : undefined,
        },
      });
    }),
  );

  console.log("Seed complete.");
  console.log("  User:   demo@kalentr.com / password123");
  console.log("  Tenant: alexmorgan.kalentr.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
