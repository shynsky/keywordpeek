"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  LOCATIONS,
  LOCATIONS_BY_CODE,
  REGION_LABELS,
  getFlagEmoji,
  getLocationsByRegion,
  type Location,
  type LocationRegion,
} from "@/lib/constants/locations";

interface LocationSelectorProps {
  value: number;
  onValueChange: (code: number, languageCode: string) => void;
  disabled?: boolean;
  showLanguage?: boolean;
  className?: string;
}

export function LocationSelector({
  value,
  onValueChange,
  disabled = false,
  showLanguage = false,
  className,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedLocation = LOCATIONS_BY_CODE.get(value) ?? LOCATIONS[0];
  const locationsByRegion = useMemo(() => getLocationsByRegion(), []);

  const handleSelect = (location: Location) => {
    onValueChange(location.code, location.languageCode);
    setOpen(false);
  };

  const regionOrder: LocationRegion[] = [
    "popular",
    "americas",
    "europe",
    "asia-pacific",
    "middle-east-africa",
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select location"
          className={cn(
            "h-auto px-2 py-1 gap-2 font-medium text-sm",
            "hover:bg-muted/50",
            className
          )}
          disabled={disabled}
        >
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="flex items-center gap-1.5">
            <span>{getFlagEmoji(selectedLocation.countryCode)}</span>
            <span className="hidden sm:inline">{selectedLocation.name}</span>
            {showLanguage && (
              <span className="text-muted-foreground uppercase text-xs">
                ({selectedLocation.languageCode})
              </span>
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {regionOrder.map((region) => (
              <CommandGroup key={region} heading={REGION_LABELS[region]}>
                {locationsByRegion[region].map((location) => (
                  <CommandItem
                    key={location.code}
                    value={`${location.name} ${location.countryCode}`}
                    onSelect={() => handleSelect(location)}
                    className="group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {getFlagEmoji(location.countryCode)}
                      </span>
                      <span>{location.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-medium tracking-wide text-muted-foreground group-data-[selected=true]:text-accent-foreground">
                        {location.languageCode}
                      </span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground group-data-[selected=true]:text-accent-foreground",
                          value === location.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
