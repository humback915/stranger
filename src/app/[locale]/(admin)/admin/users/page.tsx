import { getUsers } from "@/actions/admin";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const { users } = await getUsers();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-stranger-light">
        사용자 관리
      </h1>
      <UsersClient initialUsers={users} />
    </div>
  );
}
