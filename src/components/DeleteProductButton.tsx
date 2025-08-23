import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { useDeleteProduct } from "@/features/inventory/hooks";
import type { Product } from "@/features/inventory/types";
import type { ListParams } from "@/features/inventory/types";
import { useToast } from "@/hooks/use-toast";

export default function DeleteProductButton({
  product,
  paramsForInvalidate
}: {
  product: Product;
  paramsForInvalidate: ListParams;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const delProduct = useDeleteProduct(paramsForInvalidate);

  const onConfirm = () => {
    delProduct.mutate(product.id, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Product deleted", description: `${product.name} removed.` });
      },
      onError: (e: any) => {
        setOpen(false);
        toast({
          title: "Delete failed",
          description: e?.message || "Could not delete product.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{product.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If this product is referenced by sales or stock
            movements, deletion will be blocked. Consider archiving instead if you need to
            keep historical records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={delProduct.isPending}>
            {delProduct.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
