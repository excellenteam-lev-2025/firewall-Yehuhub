"use client";

import { useState } from "react";
import { ExistingRules } from "@/components/ExistingRules";
import { RulesAddition } from "@/components/RulesAddition";

const pages = {
  home: "home",
  form: "form",
};

export default function Home() {
  const [page, setPage] = useState(pages.home);
  return (
    <>
      <div className="bg-gray-700 flex ">
        <div className="ml-20">
          <button
            className="mr-6 cursor-pointer p-2 hover:bg-gray-600 rounded-sm"
            onClick={() => setPage(pages.home)}
          >
            Existing Rules
          </button>
          <button
            className="mr-6 cursor-pointer p-2 hover:bg-gray-600 rounded-sm"
            onClick={() => setPage(pages.form)}
          >
            Rules Addition
          </button>
        </div>
      </div>
      {page === pages.home ? <ExistingRules /> : <RulesAddition />}
    </>
  );
}
