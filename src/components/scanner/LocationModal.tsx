import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface LocationModalProps {
  open: boolean;
  onConfirm: (location: string) => void;
  onCancel: () => void;
}

export function LocationModal({ open, onConfirm, onCancel }: LocationModalProps) {
  const [location, setLocation] = useState("");

  const handleConfirm = () => {
    if (!location.trim()) return;
    onConfirm(location.trim());
    setLocation("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Local da Câmera
          </DialogTitle>
          <DialogDescription>
            Informe o local onde o reconhecimento será realizado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            placeholder="Ex: Portaria, Sala 101, Laboratório..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="hero" onClick={handleConfirm} disabled={!location.trim()}>
            Iniciar Câmera
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
