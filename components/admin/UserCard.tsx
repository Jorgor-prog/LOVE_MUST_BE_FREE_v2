"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface UserCardProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    password?: string | null;
    createdAt: string;
    isActive?: boolean;
    isAdmin?: boolean;
  };
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Card className="mb-4 shadow-md">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {user.name || "Без имени"} {user.isAdmin && <span className="text-red-500">(Админ)</span>}
        </h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <span className="font-semibold">ID:</span> {user.id}
        </p>
        <p>
          <span className="font-semibold">Статус:</span>{" "}
          {user.isActive ? "Активен" : "Заблокирован"}
        </p>
        <p>
          <span className="font-semibold">Создан:</span>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Пароль:</span>{" "}
          {user.password ? (
            <span className="font-mono text-blue-600">{user.password}</span>
          ) : (
            <span className="italic text-gray-400">нет</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
