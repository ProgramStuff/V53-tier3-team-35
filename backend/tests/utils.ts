import { Context } from "./context";
import { Role } from "@prisma/client";
import { userFactory, userCreateInputFactory } from "../factories/user";
import {
    courseFactory,
    courseCreateInputWithoutInstructorFactory,
} from "../factories/course";
import { unitCreateInputWithoutCourseFactory } from "../factories/unit";
import { lessonCreateInputWithoutUnitFactory } from "../factories/lesson";

export const cleanDatabase = async (ctx: Context) => {
    const deleteUnits = ctx.prisma.unit.deleteMany();
    const deleteCourses = ctx.prisma.course.deleteMany();
    const deleteAccounts = ctx.prisma.account.deleteMany();
    const deleteUsers = ctx.prisma.user.deleteMany();

    await ctx.prisma.$transaction([
        deleteUnits,
        deleteCourses,
        deleteAccounts,
        deleteUsers,
    ]);
};

export const createPersistentCourse = async (
    ctx: Context,
    amount: number = 1,
) => {
    const instructors = await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: 3 }, () => {
            return userCreateInputFactory(Role.INSTRUCTOR);
        }),
    });

    const instructor =
        instructors[Math.floor(Math.random() * instructors.length)];

    const courses = await ctx.prisma.course.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return {
                ...courseCreateInputWithoutInstructorFactory(),
                instructorId: instructor.id,
            };
        }),
        include: {
            instructor: true,
        },
        skipDuplicates: true,
    });

    let units;

    for (const course of courses) {
        units = await ctx.prisma.unit.createManyAndReturn({
            data: Array.from(
                { length: Math.floor(Math.random() * 10) + 1 },
                () => {
                    return {
                        ...unitCreateInputWithoutCourseFactory(),
                        courseId: course.id,
                    };
                },
            ),
        });
    }

    for (const unit of units) {
        const lessons = await ctx.prisma.lesson.createManyAndReturn({
            data: Array.from(
                { length: Math.floor(Math.random() * 10) + 1 },
                () => {
                    return {
                        ...lessonCreateInputWithoutUnitFactory(),
                        unitId: unit.id,
                    };
                },
            ),
        });
    }

    return courses;
};

export const createPersistentStudent = async (
    ctx: Context,
    amount: number = 1,
) => {
    return await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return userCreateInputFactory(Role.STUDENT);
        }),
    });
};

export const createPersistentInstructor = async (
    ctx: Context,
    amount: number = 1,
) => {
    return await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return userCreateInputFactory(Role.INSTRUCTOR);
        }),
    });
};

export const createInstructor = async () => {
    return userFactory(Role.INSTRUCTOR);
};

export const createStudent = async (amount: number = 1) => {
    return Array.from({ length: amount }, () => {
        return userFactory(Role.STUDENT);
    });
};

export const createCourses = async (amount: number = 1) => {
    return Array.from({ length: amount }, () => {
        return courseFactory();
    });
};
