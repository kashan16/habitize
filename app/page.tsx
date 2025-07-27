"use client";

import Habits from "@/components/Habits";
import Moments from "@/components/Moments";
import { SleepGraph } from "@/components/SleepGraph";
import Stats from "@/components/Stats";
import { usePage } from "@/context/PageContext";

const pageComponent = {
  Habit : <Habits/>,
  Sleep : <SleepGraph/>,
  Moments : <Moments/>,
  Stats : <Stats/>
}

export default function Home() {
  const { activePage } = usePage();

  const Content = pageComponent[activePage] ?? (
    <div>Please Select a valid page.</div>
  );

  return (
    <div className="p-6">
      {Content}
    </div>
  );
}
