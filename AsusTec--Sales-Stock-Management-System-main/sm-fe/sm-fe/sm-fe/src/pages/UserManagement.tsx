import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Table, TableRow, TableCell } from "../components/ui/Table";

interface User {
  codeUser: number;
  login: string;
  pass: string;
}

const mockUsers: User[] = [
  { codeUser: 1, login: "admin", pass: "••••••••" },
  { codeUser: 2, login: "sales_manager", pass: "••••••••" },
  { codeUser: 3, login: "stock_clerk", pass: "••••••••" },
  { codeUser: 4, login: "john_doe", pass: "••••••••" },
  { codeUser: 5, login: "marie_smith", pass: "••••••••" },
];

export default function UserManagement() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="space-y-6">
      <h1 className="text-gray-900">Users</h1>

      <Card>
        <Table headers={["ID", "Login", "Password"]}>
          {mockUsers.map((user) => (
            <TableRow key={user.codeUser}>
              <TableCell>{user.codeUser}</TableCell>
              <TableCell>{user.login}</TableCell>
              <TableCell>{user.pass}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  );
}
