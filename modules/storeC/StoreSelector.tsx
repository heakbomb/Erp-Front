// src/modules/store/StoreSelector.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { cn } from "@/shared/utils/commonUtils"; // 또는 lib/utils
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { useStore } from "@/contexts/StoreContext"; // ✅ 수정된 Context import

export function StoreSelector({ className }: { className?: string }) {
  const { stores, currentStoreId, changeStore, isLoading } = useStore();
  const [open, setOpen] = React.useState(false);

  // 현재 선택된 매장 객체 찾기
  const selectedStore = stores.find((store) => store.storeId === currentStoreId);

  if (isLoading) {
    return <Button variant="outline" disabled className="w-full justify-between">로딩 중...</Button>;
  }

  // 매장이 하나도 없을 때
  if (stores.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full justify-between text-muted-foreground">
        매장 없음
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="flex items-center truncate">
            <StoreIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            {selectedStore ? selectedStore.storeName : "매장 선택..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="매장 검색..." />
          <CommandList>
            <CommandEmpty>매장을 찾을 수 없습니다.</CommandEmpty>
            <CommandGroup heading="내 매장 목록">
              {stores.map((store) => (
                <CommandItem
                  key={store.storeId}
                  value={store.storeName}
                  onSelect={() => {
                    changeStore(store.storeId);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentStoreId === store.storeId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {store.storeName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}