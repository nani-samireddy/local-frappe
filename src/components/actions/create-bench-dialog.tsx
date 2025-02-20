import { setupBench } from "@/actions/setup-bench";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";


export function CreateBenchDialog() {
  const [benchName, setBenchName] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("");
  const [isCustomSiteName, setIsCustomSiteName] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<string>("Creating Bench...");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleBenchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBenchName(e.target.value);
    if (e.target.value) {
      // If site name is not set, set it to the bench name .local
      if (!isCustomSiteName) {
        setSiteName(e.target.value.replace(/\s+/g, "-").toLowerCase() + ".local");
      }
    }
  };

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(e.target.value);
    setIsCustomSiteName(true);
  };

  const handleOnClick = async(e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(benchName, siteName);
    await setupBench(benchName, setProgressState);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Bench</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Bench</DialogTitle>
          <DialogDescription>
            Create a new bench to start developing your project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" placeholder="My new awesome project" className="col-span-3" value={benchName} onChange={handleBenchNameChange}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sitename" className="text-right">
              Site Name
            </Label>
            <Input id="sitename" placeholder="myawesomeproject.local" className="col-span-3" value={siteName} onChange={handleSiteNameChange} />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleOnClick}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
