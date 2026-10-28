"use client";
import { useEffect, useMemo, useRef } from "react";
import { Excalidraw, serializeAsJSON, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

export default function DiagramCanvas({
  scene,
  name,
  onChange,
}: {
  scene: string;
  name: string;
  onChange: (scene: string, hasElements: boolean) => void;
}) {
  const initialData = useMemo(
    () => ({ ...JSON.parse(scene), scrollToContent: true }),
    [],
  );
  const fingerprint = useRef<string | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Excalidraw's fixed menu trigger needs a name after its responsive UI mounts.
    const labelMenu = () => {
      const button =
        surface.current?.querySelector<HTMLButtonElement>(".main-menu-trigger");
      if (button && !button.getAttribute("aria-label"))
        button.setAttribute("aria-label", "Drawing menu");
    };
    const observer = new MutationObserver(labelMenu);
    if (surface.current)
      observer.observe(surface.current, { childList: true, subtree: true });
    labelMenu();
    return () => observer.disconnect();
  }, []);

  const change: ExcalidrawProps["onChange"] = (elements, appState, files) => {
    if (appState.isLoading) return;
    const next = JSON.stringify([
      elements.map((element) => [
        element.id,
        element.version,
        element.versionNonce,
        element.isDeleted,
      ]),
      appState.viewBackgroundColor,
      Object.keys(files),
    ]);
    if (fingerprint.current === null) {
      fingerprint.current = next;
      return;
    }
    if (fingerprint.current === next) return;
    fingerprint.current = next;
    const value = JSON.parse(
      serializeAsJSON(elements, appState, files, "local"),
    );
    value.source = "precap";
    value.appState = { viewBackgroundColor: appState.viewBackgroundColor };
    onChange(
      JSON.stringify(value),
      elements.some((element) => !element.isDeleted),
    );
  };
  return (
    <div ref={surface} className="excalidraw-surface">
      <Excalidraw
        name={name}
        initialData={initialData}
        onChange={change}
        theme="light"
        handleKeyboardGlobally={false}
        validateEmbeddable={false}
        UIOptions={{
          canvasActions: {
            loadScene: true,
            saveAsImage: true,
            export: false,
            toggleTheme: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
