"use client";

import React from "react";

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
    <div className="border rounded-lg shadow-md p-4 mb-4 bg-white">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">
          {user.name || "Без имени"}{" "}
          {user.isAdmin && (
            <span className="text-red-500 font-bold">(Админ)</span>
          )}
        </h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-semibold">ID:</span> {user.id}
        </p>
        <p>
          <span className="font-semibold">Статус:</span>{" "}
          {user.isActive ? "Активен ✅" : "Неактивен ❌"}
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
      </div>
    </div>
  );
}
