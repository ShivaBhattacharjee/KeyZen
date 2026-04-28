"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  IconUpload,
  IconRotate,
  IconSparkles,
  IconFileText,
  IconCode,
} from "@tabler/icons-react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CornerBrackets } from "@/components/corner-brackets";
import { DEFAULT_CUSTOM_TEXT } from "@/lib/test-storage";
import type { CodeManifest } from "@/lib/code";
import { getCodeContent } from "@/lib/code";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const VESPER_THEME = {
  base: "vs-dark" as const,
  inherit: false,
  rules: [
    { token: "comment", foreground: "8b8b8b", fontStyle: "italic" },
    { token: "variable", foreground: "ffffff" },
    { token: "string", foreground: "99ffe4" },
    { token: "keyword", foreground: "a0a0a0" },
    { token: "number", foreground: "ffc799" },
    { token: "type", foreground: "ffc799" },
    { token: "class", foreground: "ffc799" },
    { token: "function", foreground: "ffc799" },
    { token: "operator", foreground: "a0a0a0" },
    { token: "delimiter", foreground: "a0a0a0" },
    { token: "identifier", foreground: "ffffff" },
    { token: "tag", foreground: "ffc799" },
    { token: "attribute.name", foreground: "ffc799" },
    { token: "attribute.value", foreground: "99ffe4" },
    { token: "regexp", foreground: "a0a0a0" },
    { token: "constant", foreground: "ffc799" },
    { token: "support.function", foreground: "ffc799" },
    { token: "support.type", foreground: "ffffff" },
    { token: "entity.name.tag", foreground: "ffc799" },
    { token: "entity.other.attribute-name", foreground: "ffc799" },
    { token: "markup.bold", foreground: "ffffff", fontStyle: "bold" },
    { token: "markup.italic", foreground: "ffffff", fontStyle: "italic" },
    { token: "markup.underline", foreground: "ffc799", fontStyle: "underline" },
  ],
  colors: {
    "editor.background": "#101010",
    "editor.foreground": "#FFFFFF",
    "editor.selectionBackground": "#FFFFFF25",
    "editor.selectionHighlightBackground": "#FFFFFF25",
    "editorLineNumber.foreground": "#505050",
    "editorGroupHeader.tabsBackground": "#101010",
    "editorWidget.background": "#101010",
    "editorWarning.foreground": "#FFC799",
    "editorError.foreground": "#FF8080",
    "editorOverviewRuler.border": "#101010",
    "editorGutter.addedBackground": "#99FFE4",
    "editorGutter.deletedBackground": "#FF8080",
    "editorGutter.modifiedBackground": "#FFC799",
    "diffEditor.insertedTextBackground": "#99FFE415",
    "diffEditor.insertedLineBackground": "#99FFE415",
    "diffEditor.removedTextBackground": "#FF808015",
    "diffEditor.removedLineBackground": "#FF808015",
    "editorInlayHint.foreground": "#A0A0A0",
    "editorInlayHint.background": "#1C1C1C",
    "sideBar.background": "#101010",
    "sideBarTitle.foreground": "#A0A0A0",
    "sideBarSectionHeader.foreground": "#A0A0A0",
    "sideBarSectionHeader.background": "#101010",
    "activityBar.background": "#101010",
    "activityBar.foreground": "#A0A0A0",
    "activityBarBadge.background": "#FFC799",
    "activityBarBadge.foreground": "#000000",
    "titleBar.activeBackground": "#101010",
    "titleBar.inactiveBackground": "#101010",
    "titleBar.activeForeground": "#7E7E7E",
    "titleBar.inactiveForeground": "#707070",
    "tab.border": "#101010",
    "tab.activeBackground": "#161616",
    "tab.activeBorder": "#FFC799",
    "tab.inactiveBackground": "#101010",
    "statusBar.debuggingForeground": "#FFFFFF",
    "statusBar.debuggingBackground": "#FF7300",
    "statusBar.background": "#101010",
    "statusBar.noFolderBackground": "#101010",
    "statusBar.foreground": "#A0A0A0",
    "statusBarItem.remoteBackground": "#FFC799",
    "statusBarItem.remoteForeground": "#000000",
    "list.activeSelectionForeground": "#FFC799",
    "list.inactiveSelectionBackground": "#232323",
    "badge.background": "#FFC799",
    "badge.foreground": "#000000",
    "button.background": "#FFC799",
    "button.hoverBackground": "#FFCFA8",
    "button.foreground": "#000000",
    "focusBorder": "#FFC799",
    "icon.foreground": "#A0A0A0",
    "input.background": "#1C1C1C",
    "list.activeSelectionBackground": "#232323",
    "list.hoverBackground": "#282828",
    "list.errorForeground": "#FF8080",
    "list.highlightForeground": "#FFC799",
    "selection.background": "#666666",
    "editorBracketHighlight.foreground1": "#A0A0A0",
    "editorBracketHighlight.foreground2": "#A0A0A0",
    "editorBracketHighlight.foreground3": "#A0A0A0",
    "editorBracketHighlight.foreground4": "#A0A0A0",
    "editorBracketHighlight.foreground5": "#A0A0A0",
    "editorBracketHighlight.foreground6": "#A0A0A0",
    "editorBracketHighlight.unexpectedBracket.foreground": "#FF8080",
    "textLink.foreground": "#FFC799",
    "textLink.activeForeground": "#FFCFA8",
    "editorHoverWidget.background": "#161616",
    "editorHoverWidget.border": "#282828",
    "scrollbarSlider.background": "#34343480",
    "scrollbarSlider.hoverBackground": "#343434",
    "settings.modifiedItemIndicator": "#FFC799",
  },
  tokenColors: [
    {
      name: "Comment",
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8B8B8B" },
    },
    {
      name: "Variables",
      scope: ["variable", "string constant.other.placeholder", "entity.name.tag"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Colors",
      scope: ["constant.other.color"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Invalid",
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Keyword, Storage",
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Operator, Misc",
      scope: [
        "keyword.control",
        "constant.other.color",
        "punctuation.definition.tag",
        "punctuation.separator.inheritance.php",
        "punctuation.definition.tag.html",
        "punctuation.definition.tag.begin.html",
        "punctuation.definition.tag.end.html",
        "punctuation.section.embedded",
        "keyword.other.template",
        "keyword.other.substitution",
      ],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Tag",
      scope: ["entity.name.tag", "meta.tag.sgml", "markup.deleted.git_gutter"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Function, Special Method",
      scope: [
        "entity.name.function",
        "variable.function",
        "support.function",
        "keyword.other.special-method",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Block Level Variables",
      scope: ["meta.block variable.other"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Other Variable, String Link",
      scope: ["support.other.variable", "string.other.link"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Number, Constant, Function Argument, Tag Attribute, Embedded",
      scope: [
        "constant.numeric",
        "support.constant",
        "constant.character",
        "constant.escape",
        "keyword.other.unit",
        "keyword.other",
        "constant.language.boolean",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "String, Symbols, Inherited Class",
      scope: [
        "string",
        "constant.other.symbol",
        "constant.other.key",
        "meta.group.braces.curly constant.other.object.key.js string.unquoted.label.js",
      ],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Class, Support",
      scope: [
        "entity.name",
        "support.type",
        "support.class",
        "support.other.namespace.use.php",
        "meta.use.php",
        "support.other.namespace.php",
        "markup.changed.git_gutter",
        "support.type.sys-types",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS Class and Support",
      scope: [
        "source.css support.type.property-name",
        "source.sass support.type.property-name",
        "source.scss support.type.property-name",
        "source.less support.type.property-name",
        "source.stylus support.type.property-name",
        "source.postcss support.type.property-name",
        "support.type.vendored.property-name.css",
        "source.css.scss entity.name.tag",
        "variable.parameter.keyframe-list.css",
        "meta.property-name.css",
        "variable.parameter.url.scss",
        "meta.property-value.scss",
        "meta.property-value.css",
      ],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Sub-methods",
      scope: ["entity.name.module.js", "variable.import.parameter.js", "variable.other.class.js"],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Language methods",
      scope: ["variable.language"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "entity.name.method.js",
      scope: ["entity.name.method.js"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "meta.method.js",
      scope: ["meta.class-method.js entity.name.function.js", "variable.function.constructor"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Attributes",
      scope: [
        "entity.other.attribute-name",
        "meta.property-list.scss",
        "meta.attribute-selector.scss",
        "meta.property-value.css",
        "entity.other.keyframe-offset.css",
        "meta.selector.css",
        "entity.name.tag.reference.scss",
        "entity.name.tag.nesting.css",
        "punctuation.separator.key-value.css",
      ],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "HTML Attributes",
      scope: ["text.html.basic entity.other.attribute-name.html", "text.html.basic entity.other.attribute-name"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS Classes",
      scope: [
        "entity.other.attribute-name.class",
        "entity.other.attribute-name.id",
        "meta.attribute-selector.scss",
        "variable.parameter.misc.css",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS ID's",
      scope: ["source.sass keyword.control", "meta.attribute-selector.scss"],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Inserted",
      scope: ["markup.inserted"],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Deleted",
      scope: ["markup.deleted"],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Changed",
      scope: ["markup.changed"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Regular Expressions",
      scope: ["string.regexp"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Escape Characters",
      scope: ["constant.character.escape"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "URL",
      scope: ["*url*", "*link*", "*uri*"],
      settings: { fontStyle: "underline" },
    },
    {
      name: "Decorators",
      scope: ["tag.decorator.js entity.name.tag.js", "tag.decorator.js punctuation.definition.tag.js"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "ES7 Bind Operator",
      scope: ["source.js constant.other.object.key.js string.unquoted.label.js"],
      settings: { fontStyle: "italic", foreground: "#FF8080" },
    },
    {
      name: "JSON Key - Level 0",
      scope: ["source.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 1",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 2",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 3",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 4",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 5",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 6",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 7",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "JSON Key - Level 8",
      scope: ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Markdown - Plain",
      scope: ["text.html.markdown", "punctuation.definition.list_item.markdown"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markdown - Markup Raw Inline",
      scope: ["text.html.markdown markup.inline.raw.markdown"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Markdown - Markup Raw Inline Punctuation",
      scope: ["text.html.markdown markup.inline.raw.markdown punctuation.definition.raw.markdown"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markdown - Heading",
      scope: [
        "markdown.heading",
        "markup.heading | markup.heading entity.name",
        "markup.heading.markdown punctuation.definition.heading.markdown",
        "markup.heading",
        "markup.inserted.git_gutter",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Markup - Italic",
      scope: ["markup.italic"],
      settings: { fontStyle: "italic", foreground: "#FFFFFF" },
    },
    {
      name: "Markup - Bold",
      scope: ["markup.bold", "markup.bold string"],
      settings: { fontStyle: "bold", foreground: "#FFFFFF" },
    },
    {
      name: "Markup - Bold-Italic",
      scope: [
        "markup.bold markup.italic",
        "markup.italic markup.bold",
        "markup.quote markup.bold",
        "markup.bold markup.italic string",
        "markup.italic markup.bold string",
        "markup.quote markup.bold string",
      ],
      settings: { fontStyle: "bold", foreground: "#FFFFFF" },
    },
    {
      name: "Markup - Underline",
      scope: ["markup.underline"],
      settings: { fontStyle: "underline", foreground: "#FFC799" },
    },
    {
      name: "Markdown - Blockquote",
      scope: ["markup.quote punctuation.definition.blockquote.markdown"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markup - Quote",
      scope: ["markup.quote"],
    },
    {
      name: "Markdown - Link",
      scope: ["string.other.link.title.markdown"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markdown - Link Description",
      scope: ["string.other.link.description.title.markdown"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Markdown - Link Anchor",
      scope: ["constant.other.reference.link.markdown"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Markup - Raw Block",
      scope: ["markup.raw.block"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Markdown - Raw Block Fenced",
      scope: ["markup.raw.block.fenced.markdown"],
      settings: { foreground: "#000000" },
    },
    {
      name: "Markdown - Fenced Bode Block",
      scope: ["punctuation.definition.fenced.markdown"],
      settings: { foreground: "#000000" },
    },
    {
      name: "Markdown - Fenced Bode Block Variable",
      scope: ["markup.raw.block.fenced.markdown", "variable.language.fenced.markdown", "punctuation.section.class.end"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markdown - Fenced Language",
      scope: ["variable.language.fenced.markdown"],
      settings: { foreground: "#FFFFFF" },
    },
    {
      name: "Markdown - Separator",
      scope: ["meta.separator"],
      settings: { fontStyle: "bold", foreground: "#65737E" },
    },
    {
      name: "Markup - Table",
      scope: ["markup.table"],
      settings: { foreground: "#FFFFFF" },
    },
  ],
};

const MONACO_LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  go: "go",
  rust: "rust",
  cpp: "cpp",
  c: "c",
  lua: "lua",
  shell: "shell",
  dart: "dart",
};

// Map file extensions → our language codes
const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  go: "go",
  rs: "rust",
  c: "c",
  h: "c",
  lua: "lua",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  dart: "dart",
};

const MAX_CHARS = 20000;
const DIALOG_CODE_MODE_KEY = "tc-dialog-code-mode";
const DIALOG_CODE_LANG_KEY = "tc-dialog-code-lang";

interface CustomTextDialogProps {
  value: string;
  onSave: (next: string, codeLanguage?: string) => void;
  trigger: React.ReactNode;
  codeManifest: CodeManifest;
}

export function CustomTextDialog({
  value,
  onSave,
  trigger,
  codeManifest,
}: CustomTextDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState("");
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (open) {
      setDraft(value);
      try {
        const savedCodeMode = localStorage.getItem(DIALOG_CODE_MODE_KEY) === "true";
        const savedLang = localStorage.getItem(DIALOG_CODE_LANG_KEY) ?? "";
        setIsCodeMode(savedCodeMode);
        setSelectedLang(savedCodeMode ? savedLang : "");
      } catch {
        setIsCodeMode(false);
        setSelectedLang("");
      }
    }
  }, [open, value]);

  const words = draft.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = draft.length;
  const overLimit = charCount > MAX_CHARS;

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.size > MAX_CHARS * 4) {
      toast.error("file is too large");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (isCodeMode) {
      const lang = EXT_TO_LANG[ext];
      if (!lang) {
        toast.error(`unsupported file type: .${ext}`);
        return;
      }
      try {
        const text = await file.text();
        setDraft(text);
        setSelectedLang(lang);
        localStorage.setItem(DIALOG_CODE_LANG_KEY, lang);
        toast.success(`loaded ${file.name} as ${lang}`);
      } catch {
        toast.error("could not read file");
      }
    } else {
      const detectedLang = EXT_TO_LANG[ext];
      if (detectedLang) {
        // Code file uploaded while in text mode — ask user to switch
        try {
          const text = await file.text();
          toast(`${file.name} looks like ${detectedLang} code`, {
            description: "Switch to code mode to get syntax highlighting and line numbers.",
            duration: 8000,
            action: {
              label: "Enable code mode",
              onClick: () => {
                setDraft(text);
                setIsCodeMode(true);
                setSelectedLang(detectedLang);
                localStorage.setItem(DIALOG_CODE_MODE_KEY, "true");
                localStorage.setItem(DIALOG_CODE_LANG_KEY, detectedLang);
              },
            },
          });
          // Also load the text as-is so they can still use it in text mode
          setDraft(text);
        } catch {
          toast.error("could not read file");
        }
        return;
      }
      if (ext !== "txt" && file.type !== "text/plain") {
        toast.error("only .txt files are supported");
        return;
      }
      try {
        const text = await file.text();
        setDraft(text);
        toast.success(`loaded ${file.name}`);
      } catch {
        toast.error("could not read file");
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    void handleFile(f);
  }

  function handleSave() {
    const cleaned = draft.trim();
    if (!cleaned) {
      toast.error("text cannot be empty");
      return;
    }
    if (overLimit) {
      toast.error(`text too long (${charCount}/${MAX_CHARS})`);
      return;
    }
    if (isCodeMode && !selectedLang) {
      toast.error("select a language for code mode");
      return;
    }
    onSave(cleaned, isCodeMode ? selectedLang : undefined);
    setOpen(false);
  }

  function resetToDefault() {
    if (isCodeMode && selectedLang && codeManifest[selectedLang]) {
      const chapters = codeManifest[selectedLang].chapters;
      const chapter = chapters[Math.floor(Math.random() * chapters.length)];
      const content = getCodeContent(selectedLang, chapter);
      if (content) { setDraft(content); return; }
    }
    setDraft(DEFAULT_CUSTOM_TEXT);
  }

  function clearAll() {
    setDraft("");
  }

  const dirty = draft !== value;
  const selectedLangEntry = selectedLang ? codeManifest[selectedLang] : undefined;
  const monacoLang = MONACO_LANG_MAP[selectedLang] ?? "plaintext";
  const monacoTheme = resolvedTheme === "light" ? "light" : "vs-dark";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[860px] w-[min(860px,calc(100vw-2rem))]",
          "max-h-[90dvh] md:h-[min(75dvh,560px)]",
          "p-0 overflow-y-auto md:overflow-hidden",
          "duration-300 ease-out",
          "data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2",
          "data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2",
        )}
        onOpenAutoFocus={(e) => {
          // Let Monaco grab focus naturally; only prevent if not in code mode
          if (!isCodeMode) e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          // Directly focus the typing input after dialog closes
          const typingInput = document.querySelector<HTMLInputElement>(
            'input[autocapitalize="none"][spellcheck="false"].absolute'
          );
          typingInput?.focus();
        }}
      >
        <div className="flex flex-col md:grid md:grid-cols-[1.6fr_1fr] md:h-full md:overflow-hidden">
          {/* Left column: editor */}
          <div className="flex flex-col gap-3 border-b border-border p-5 md:border-r md:border-b-0 md:min-h-0 md:overflow-hidden">
            <DialogHeader className="gap-1">
              <DialogTitle className="font-(family-name:--font-doto) text-2xl font-bold tracking-wide">
                {isCodeMode ? "Custom Code" : "Custom Text"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isCodeMode
                  ? "Edit code below. Line breaks create new lines with indentation."
                  : "Paste anything. Words split on whitespace. Test ends on the last word."}
              </DialogDescription>
            </DialogHeader>

            {/* Upload button — mobile only, shown above the editor */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="md:hidden group flex items-center gap-3 rounded-md border border-dashed border-border px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <IconUpload size={16} stroke={1.5} className="shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="font-medium text-foreground">
                  {isCodeMode ? "Upload code file" : "Upload .txt"}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {isCodeMode ? ".js .ts .py .go .rs .c .lua .sh .dart" : "or drop one onto the editor"}
                </span>
              </span>
            </button>

            {isCodeMode && selectedLang ? (
              /* Monaco editor — explicit height on mobile, flex-1 on desktop */
              <div className="h-[220px] md:h-auto md:flex-1 md:min-h-0 overflow-hidden rounded-md border border-border">
                <MonacoEditor
                  height="100%"
                  language={monacoLang}
                  theme="vesper"
                  value={draft}
                  onChange={(v) => setDraft(v ?? "")}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme("vesper", VESPER_THEME);
                    if ((monaco as any).env) {
                      (monaco as any).env.clipboard = {
                        readText: async () => "",
                        writeText: async (_text: string) => {},
                      };
                    }
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    overviewRulerLanes: 0,
                    scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                    padding: { top: 10, bottom: 10 },
                    renderLineHighlight: "none",
                    folding: false,
                    contextmenu: false,
                  }}
                />
              </div>
            ) : (
              /* Plain textarea — explicit height on mobile, flex-1 on desktop */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative h-[200px] md:h-auto md:flex-1 md:min-h-0"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  spellCheck={false}
                  placeholder="Paste your text here…"
                  className={cn(
                    "font-mono block h-full w-full resize-none rounded-md border border-border bg-background/40 p-3 text-sm leading-relaxed text-foreground",
                    "placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
                    overLimit && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] uppercase tracking-widest",
                    overLimit ? "text-destructive" : "text-muted-foreground/50",
                  )}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/60">
              <span>
                <span className="text-primary tabular-nums">{wordCount}</span> words
              </span>
              <span className="opacity-40">·</span>
              <span>
                <span className="text-primary tabular-nums">{charCount}</span> chars
              </span>
              {dirty && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-primary">unsaved</span>
                </>
              )}
            </div>
          </div>

          {/* Right column: actions */}
          <div className="flex flex-col gap-4 p-5 md:overflow-y-auto">
            <section className="hidden md:flex flex-col gap-2">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Source
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex items-center gap-3 rounded-md border border-dashed border-border px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                <IconUpload size={16} stroke={1.5} className="shrink-0" />
                <span className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {isCodeMode ? "Upload code file" : "Upload .txt"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {isCodeMode
                      ? ".js .ts .py .go .rs .c .lua .sh .dart"
                      : "or drop one onto the editor"}
                  </span>
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={isCodeMode
                  ? Object.keys(EXT_TO_LANG).map((e) => `.${e}`).join(",")
                  : ".txt,text/plain"}
                onChange={(e) => {
                  void handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </section>

            <div className="hidden md:block h-px bg-border" />

            {/* Code mode toggle */}
            <section className="flex flex-col gap-3">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Code
              </h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                  <IconCode size={12} />
                  Code mode
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCodeMode;
                    setIsCodeMode(next);
                    localStorage.setItem(DIALOG_CODE_MODE_KEY, String(next));
                    if (!next) { setSelectedLang(""); localStorage.removeItem(DIALOG_CODE_LANG_KEY); }
                  }}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer",
                    isCodeMode ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform duration-200",
                      isCodeMode && "translate-x-4"
                    )}
                  />
                </button>
              </div>

              <Popover open={isCodeMode && langPickerOpen} onOpenChange={(v) => isCodeMode && setLangPickerOpen(v)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={!isCodeMode}
                    aria-expanded={langPickerOpen}
                    className={cn(
                      "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
                      isCodeMode
                        ? "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <span className="min-w-0 truncate text-muted-foreground">
                      {selectedLangEntry ? selectedLangEntry.name : "Select language…"}
                    </span>
                    <CaretDownIcon
                      className="size-4 shrink-0 text-muted-foreground"
                      weight="bold"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="gap-0 p-0"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {Object.values(codeManifest).map((lang) => (
                          <CommandItem
                            key={lang.code}
                            value={lang.code}
                            keywords={[lang.name]}
                            data-checked={selectedLang === lang.code ? true : undefined}
                            onSelect={() => {
                              setSelectedLang(lang.code);
                              localStorage.setItem(DIALOG_CODE_LANG_KEY, lang.code);
                              setLangPickerOpen(false);
                            }}
                          >
                            {lang.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </section>

            <div className="h-px bg-border" />

            <section className="flex flex-col gap-2">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tools
              </h3>
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconSparkles size={14} stroke={1.5} />
                {isCodeMode && selectedLang ? "Load random sample" : "Load sample pangram"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconRotate size={14} stroke={1.5} />
                Clear editor
              </button>
            </section>

            <div className="h-px bg-border" />

            <section className="hidden md:flex flex-col gap-2 text-[10px] leading-relaxed text-muted-foreground/60">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tips
              </h3>
              <p className="flex items-start gap-1.5">
                <IconFileText size={11} className="mt-[1px] shrink-0 opacity-60" />
                Punctuation and casing are preserved.
              </p>
              <p className="flex items-start gap-1.5">
                <IconFileText size={11} className="mt-[1px] shrink-0 opacity-60" />
                {isCodeMode
                  ? "Line breaks create new code lines with indentation."
                  : "Line breaks are collapsed into spaces."}
              </p>
            </section>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
              <CornerBrackets className="w-full">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
                >
                  Cancel
                </button>
              </CornerBrackets>
              <CornerBrackets className="w-full">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={overLimit || draft.trim().length === 0 || (isCodeMode && !selectedLang)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm bg-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save & Start
                </button>
              </CornerBrackets>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
