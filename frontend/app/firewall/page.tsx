"use client";

import { useState, useEffect } from "react";
import { ExistingRules } from "@/components/ExistingRules";
import { RulesAddition } from "@/components/RulesAddition";
import { Button } from "@/components/ui/button";

const pages = {
  home: "home",
  form: "form",
};

export default function Rules() {
  const [page, setPage] = useState(pages.home);

  return (
    <>
      <div className="bg-secondary flex">
        <div className="ml-20">
          <Button
            variant="secondary"
            className="border-none hover:bg-ring "
            onClick={() => setPage(pages.home)}
          >
            Existing Rules
          </Button>
          <Button
            variant="secondary"
            className="border-none hover:bg-ring "
            onClick={() => setPage(pages.form)}
          >
            Rules Addition
          </Button>
        </div>
      </div>
      {page === pages.home ? <ExistingRules /> : <RulesAddition />}
    </>
  );
}
