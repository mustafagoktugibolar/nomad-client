import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.js";

export type ComboboxData = {
  value: string;
  label: string;
};

type ComboboxProps = {
  datas: ComboboxData[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export const Combobox: React.FC<ComboboxProps> = ({
  datas,
  placeholder = "Bir seçenek seçin...",
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");

  const activeValue = value ?? internalValue;
  const selectedLabel = datas.find((d) => d.value === activeValue)?.label;

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-md px-3 py-2 text-sm shadow-sm"
        >
          {selectedLabel ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Ara..." />
          <CommandList>
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            <CommandGroup>
              {datas.map((data) => (
                <CommandItem
                  key={data.value}
                  value={data.value}
                  onSelect={() => handleSelect(data.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      activeValue === data.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {data.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
