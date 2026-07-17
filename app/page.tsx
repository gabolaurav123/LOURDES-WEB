import { getChatGPTUser } from "./chatgpt-auth";
import { Platform } from "./platform";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <Platform signedInUser={user ? { name: user.displayName, email: user.email } : null} />;
}
