import { CSSProperties, FormEvent, useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { Alert, PostValidationPopup, ShoppingPost, Success } from "../../components/index.ts";
import { getPosts, createDate, updateDateItem, deletePost, deletePosts, createPost, updatePost } from "../../controllers/ShoppingPostsController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { convertStringToDate } from "../../utils/index.ts";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import QuantityInput from "../../components/QuantityInput.tsx";
import { DEFAULT_COMMON_GROCERY_PRESETS } from "../../constants/defaultShoppingHistory.ts";
import { ShoppingDay, ShoppingPost as ShoppingPostType } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";
import "../../style/shopping-board.css";

registerLocale("fr", fr);

const formatShoppingDate = (date: Date): string => date.toLocaleDateString("fr-FR");
const SHOPPING_HISTORY_KEY = "shopping-history-v1";
const SHOPPING_HISTORY_VERSION_KEY = "shopping-history-defaults-version";
const SHOPPING_HISTORY_VERSION = "3";
const SHOPPING_HISTORY_LIMIT = 500;

interface ShoppingHistoryEntry {
  key: string;
  title: string;
  normalizedTitle: string;
  count: number;
  unit: string;
  priorityColor: number;
  frequency: number;
  lastAddedAt: string;
  seedRank?: number;
}

const normalizeShoppingTitle = (title: string): string => title.trim().toLowerCase();
const normalizeShoppingUnit = (unit?: string): string => {
  const normalizedUnit = String(unit || "").trim();
  return normalizedUnit === "u" ? "" : normalizedUnit;
};

const loadShoppingHistoryVersion = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SHOPPING_HISTORY_VERSION_KEY) || "";
};

const hasStoredShoppingHistory = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SHOPPING_HISTORY_KEY) !== null;
};

const loadShoppingHistory = (): ShoppingHistoryEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawHistory = window.localStorage.getItem(SHOPPING_HISTORY_KEY);

    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory);

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory
      .filter((entry): entry is Partial<ShoppingHistoryEntry> => typeof entry === "object" && entry !== null)
      .map((entry) => ({
        key: String(entry.key || normalizeShoppingTitle(String(entry.title || ""))),
        title: String(entry.title || ""),
        normalizedTitle: String(entry.normalizedTitle || normalizeShoppingTitle(String(entry.title || ""))),
        count: Number(entry.count || 1),
        unit: normalizeShoppingUnit(String(entry.unit || "")),
        priorityColor: Number(entry.priorityColor || 0),
        frequency: Number(entry.frequency ?? 1),
        lastAddedAt: String(entry.lastAddedAt || ""),
        seedRank: Number(entry.seedRank || 0),
      }))
      .filter((entry) => entry.normalizedTitle !== "")
      .sort(sortShoppingHistory)
      .slice(0, SHOPPING_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

const saveShoppingHistory = (history: ShoppingHistoryEntry[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHOPPING_HISTORY_KEY, JSON.stringify(trimShoppingHistory(history)));
  window.localStorage.setItem(SHOPPING_HISTORY_VERSION_KEY, SHOPPING_HISTORY_VERSION);
};

const sortShoppingHistory = (leftEntry: ShoppingHistoryEntry, rightEntry: ShoppingHistoryEntry): number => {
  if (rightEntry.frequency !== leftEntry.frequency) {
    return rightEntry.frequency - leftEntry.frequency;
  }

  if (rightEntry.lastAddedAt !== leftEntry.lastAddedAt) {
    return rightEntry.lastAddedAt.localeCompare(leftEntry.lastAddedAt);
  }

  if ((rightEntry.seedRank || 0) !== (leftEntry.seedRank || 0)) {
    return (rightEntry.seedRank || 0) - (leftEntry.seedRank || 0);
  }

  return leftEntry.title.localeCompare(rightEntry.title, "fr-FR");
};

const trimShoppingHistory = (history: ShoppingHistoryEntry[]): ShoppingHistoryEntry[] =>
  [...history].sort(sortShoppingHistory).slice(0, SHOPPING_HISTORY_LIMIT);

const mergeShoppingHistory = (...collections: ShoppingHistoryEntry[][]): ShoppingHistoryEntry[] => {
  const historyMap = new Map<string, ShoppingHistoryEntry>();

  collections.flat().forEach((entry) => {
    const normalizedTitle = normalizeShoppingTitle(entry.normalizedTitle || entry.title);

    if (!normalizedTitle) {
      return;
    }

    const currentEntry = historyMap.get(normalizedTitle);

    if (!currentEntry) {
      historyMap.set(normalizedTitle, {
        ...entry,
        key: normalizedTitle,
        normalizedTitle,
        title: entry.title.trim(),
        count: entry.count || 1,
        unit: normalizeShoppingUnit(entry.unit),
        priorityColor: entry.priorityColor ?? 0,
        frequency: entry.frequency ?? 1,
        lastAddedAt: entry.lastAddedAt || "",
        seedRank: entry.seedRank || 0,
      });
      return;
    }

    historyMap.set(normalizedTitle, {
      ...currentEntry,
      ...entry,
      key: normalizedTitle,
      normalizedTitle,
      title: entry.title.trim() || currentEntry.title,
      count: entry.count || currentEntry.count,
      unit: normalizeShoppingUnit(entry.unit || currentEntry.unit),
      priorityColor: entry.priorityColor ?? currentEntry.priorityColor,
      frequency: Math.max(currentEntry.frequency, entry.frequency ?? 1),
      lastAddedAt: entry.lastAddedAt || currentEntry.lastAddedAt,
      seedRank: Math.max(currentEntry.seedRank || 0, entry.seedRank || 0),
    });
  });

  return trimShoppingHistory([...historyMap.values()]);
};

const buildDefaultShoppingHistory = (): ShoppingHistoryEntry[] =>
  DEFAULT_COMMON_GROCERY_PRESETS.map((preset, index) => {
    const title = preset.title;
    const normalizedTitle = normalizeShoppingTitle(title);

    return {
      key: normalizedTitle,
      title,
      normalizedTitle,
      count: preset.count,
      unit: normalizeShoppingUnit(preset.unit),
      priorityColor: 0,
      frequency: 1,
      lastAddedAt: "",
      seedRank: DEFAULT_COMMON_GROCERY_PRESETS.length - index,
    };
  });

const upsertShoppingHistory = (
  history: ShoppingHistoryEntry[],
  item: { title: string; count: number; unit: string; priorityColor: number }
): ShoppingHistoryEntry[] => {
  const normalizedTitle = normalizeShoppingTitle(item.title);

  if (!normalizedTitle) {
    return history;
  }

  const nextHistory = [...history];
  const historyIndex = nextHistory.findIndex((entry) => entry.normalizedTitle === normalizedTitle);
  const lastAddedAt = new Date().toISOString();

  if (historyIndex >= 0) {
    const currentEntry = nextHistory[historyIndex];
    nextHistory[historyIndex] = {
      ...currentEntry,
      title: item.title.trim(),
      count: item.count,
      unit: normalizeShoppingUnit(item.unit),
      priorityColor: item.priorityColor,
      frequency: currentEntry.frequency + 1,
      lastAddedAt,
      seedRank: currentEntry.seedRank || 0,
    };
  } else {
    nextHistory.push({
      key: normalizedTitle,
      title: item.title.trim(),
      normalizedTitle,
      count: item.count,
      unit: normalizeShoppingUnit(item.unit),
      priorityColor: item.priorityColor,
      frequency: 1,
      lastAddedAt,
      seedRank: 0,
    });
  }

  return trimShoppingHistory(nextHistory);
};

const buildInitialHistory = (shoppingItems: ShoppingDay[]): ShoppingHistoryEntry[] => {
  const historyMap = new Map<string, ShoppingHistoryEntry>();

  shoppingItems.forEach((shoppingItem) => {
    shoppingItem.shoppingList.forEach((post) => {
      const normalizedTitle = normalizeShoppingTitle(post.title);

      if (!normalizedTitle) {
        return;
      }

      const currentEntry = historyMap.get(normalizedTitle);
      const createdAt = post.createdAt || "";

      if (currentEntry) {
        currentEntry.frequency += 1;

        if (createdAt >= currentEntry.lastAddedAt) {
          currentEntry.title = post.title;
          currentEntry.count = post.count;
          currentEntry.unit = normalizeShoppingUnit(post.unit);
          currentEntry.priorityColor = post.priorityColor;
          currentEntry.lastAddedAt = createdAt;
        }

        return;
      }

      historyMap.set(normalizedTitle, {
        key: normalizedTitle,
        title: post.title,
        normalizedTitle,
        count: post.count,
        unit: normalizeShoppingUnit(post.unit),
        priorityColor: post.priorityColor,
        frequency: 1,
        lastAddedAt: createdAt,
        seedRank: 0,
      });
    });
  });

  return trimShoppingHistory([...historyMap.values()]);
};

const PRIORITY_OPTIONS = [
  { value: 0, label: "Essentiel" },
  { value: 1, label: "Faible" },
  { value: 2, label: "A prevoir" },
  { value: 3, label: "Urgent" },
];

const DEFAULT_QUICK_ADD = { title: "", count: 1, unit: "", priorityColor: 0 };

const SHOPPING_ACCENTS = [
  {
    accent: "rgba(20, 108, 148, 0.92)",
    soft: "rgba(20, 108, 148, 0.16)",
    glow: "rgba(20, 108, 148, 0.28)",
  },
  {
    accent: "rgba(31, 138, 112, 0.92)",
    soft: "rgba(31, 138, 112, 0.16)",
    glow: "rgba(31, 138, 112, 0.28)",
  },
  {
    accent: "rgba(207, 106, 39, 0.92)",
    soft: "rgba(207, 106, 39, 0.16)",
    glow: "rgba(207, 106, 39, 0.28)",
  },
  {
    accent: "rgba(188, 83, 85, 0.92)",
    soft: "rgba(188, 83, 85, 0.16)",
    glow: "rgba(188, 83, 85, 0.28)",
  },
];

const ShoppingTab = () => {
  const { shoppingItems, setShoppingItems } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const canWrite = canUserWrite(user);
  const hasStoredHistoryKeyRef = useRef<boolean | null>(null);
  const initialStoredHistoryRef = useRef<ShoppingHistoryEntry[] | null>(null);
  const shouldSeedDefaultHistoryRef = useRef<boolean | null>(null);
  const hasLoadedLists = useRef(false);
  const hasSeededHistory = useRef(false);

  if (hasStoredHistoryKeyRef.current === null) {
    hasStoredHistoryKeyRef.current = hasStoredShoppingHistory();
  }

  if (initialStoredHistoryRef.current === null) {
    initialStoredHistoryRef.current = loadShoppingHistory();
  }

  if (shouldSeedDefaultHistoryRef.current === null) {
    shouldSeedDefaultHistoryRef.current =
      !hasStoredHistoryKeyRef.current || loadShoppingHistoryVersion() !== SHOPPING_HISTORY_VERSION;
  }

  const countRegex = /^[1-9]([0-9]{0,2})([.,][0-9]+)?$/;

  const [popupShopping, setPopupShopping] = useState<{
    shoppingId: string;
    title: string;
    count: number;
    unit: string;
    priorityColor: number;
  }>({
    shoppingId: "",
    title: "",
    count: 1,
    unit: "",
    priorityColor: 0,
  });
  const [isCountValid, setIsCountValid] = useState<boolean>(true);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [quickAddItem, setQuickAddItem] = useState<{ title: string; count: number; unit: string; priorityColor: number }>(DEFAULT_QUICK_ADD);
  const [isQuickAddCountValid, setIsQuickAddCountValid] = useState<boolean>(true);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingHistoryEntry[]>(() =>
    shouldSeedDefaultHistoryRef.current
      ? mergeShoppingHistory(buildDefaultShoppingHistory(), initialStoredHistoryRef.current || [])
      : trimShoppingHistory(initialStoredHistoryRef.current || [])
  );

  const sortShoppingPosts = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoadingLists(true);
    }

    try {
      const data = await getPosts();
      const sortedShoppingDays = data.posts
        .map((shoppingDay) => ({
          ...shoppingDay,
          shoppingList: shoppingDay.shoppingList
            .map((post) => ({
              ...post,
              unit: normalizeShoppingUnit(post.unit),
            }))
            .sort((a, b) => b.priorityColor - a.priorityColor),
        }))
        .sort((a, b) => convertStringToDate(b.date).getTime() - convertStringToDate(a.date).getTime());

      setShoppingItems(sortedShoppingDays);
      setSelectedListId((currentListId) =>
        currentListId && sortedShoppingDays.some((shoppingDay) => shoppingDay._id === currentListId)
          ? currentListId
          : sortedShoppingDays[0]?._id || null
      );
    } catch (shoppingError) {
      const errorMessage = shoppingError instanceof Error ? shoppingError.message : "Impossible de charger les paniers";
      setError(errorMessage);
    } finally {
      if (showLoader) {
        setIsLoadingLists(false);
      }
    }
  }, [setError, setShoppingItems]);

  useEffect(() => {
    if (hasLoadedLists.current) {
      return;
    }

    hasLoadedLists.current = true;
    void sortShoppingPosts(true);
  }, [sortShoppingPosts]);

  useEffect(() => {
    saveShoppingHistory(shoppingHistory);
  }, [shoppingHistory]);

  useEffect(() => {
    if (hasSeededHistory.current) {
      return;
    }

    if (hasStoredHistoryKeyRef.current) {
      hasSeededHistory.current = true;
      return;
    }

    if (shoppingItems.length === 0) {
      return;
    }

    setShoppingHistory((currentHistory) => mergeShoppingHistory(currentHistory, buildInitialHistory(shoppingItems)));
    hasSeededHistory.current = true;
  }, [shoppingItems]);

  const updatePopup = (key: string, value: string | number) => {
    setPopupShopping((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const setTitle = (title: string) => {
    updatePopup("title", title);
  };

  const setCount = (count: number) => {
    updatePopup("count", count);
  };

  const setUnit = (unit: string) => {
    updatePopup("unit", unit);
  };

  const setPriorityColor = (priorityColor: number) => {
    updatePopup("priorityColor", priorityColor);
  };

  const activeList = shoppingItems.find((shoppingItem) => shoppingItem._id === selectedListId) || shoppingItems[0] || null;
  const activeListIndex = activeList ? shoppingItems.findIndex((shoppingItem) => shoppingItem._id === activeList._id) : 0;
  const quickAddQuery = normalizeShoppingTitle(quickAddItem.title);
  const quickSuggestions = shoppingHistory
    .filter((entry) => !quickAddQuery || entry.normalizedTitle.includes(quickAddQuery))
    .sort((leftEntry, rightEntry) => {
      if (quickAddQuery) {
        const rightStartsWithQuery = Number(rightEntry.normalizedTitle.startsWith(quickAddQuery));
        const leftStartsWithQuery = Number(leftEntry.normalizedTitle.startsWith(quickAddQuery));

        if (rightStartsWithQuery !== leftStartsWithQuery) {
          return rightStartsWithQuery - leftStartsWithQuery;
        }
      }

      return sortShoppingHistory(leftEntry, rightEntry);
    })
    .slice(0, 10);

  const setAllFields = (post: ShoppingPostType) => {
    setPopupShopping({
      shoppingId: post._id,
      title: post.title,
      count: post.count,
      unit: normalizeShoppingUnit(post.unit),
      priorityColor: post.priorityColor,
    });
  };

  const openUpdatePopup = (post: ShoppingPostType) => {
    if (!canWrite) {
      return;
    }

    setAllFields(post);
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
  };

  const handleCreateDate = async () => {
    if (!canWrite) {
      return;
    }

    if (isCreatingList) {
      return;
    }

    setIsCreatingList(true);

    try {
      setSelectedListId(null);
      const msg = await handleAsyncOperation(
        async () => {
          const created = await createDate(formatShoppingDate(new Date()), "Panier du moment");
          await sortShoppingPosts();
          return created;
        },
        null
      );

      if (msg?.success) {
        setSuccess(msg.success);
      }
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleUpdateDateItem = async (shoppingListId: string, name: string, date: string) => {
    if (!canWrite) {
      return;
    }

    const trimmedName = name.trim();

    await handleAsyncOperation(
      async () => {
        const msg = await updateDateItem(shoppingListId, trimmedName, date);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
      }
    });
  };

  const handleUpdate = async () => {
    if (!canWrite) {
      return;
    }

    const normalizedUnit = normalizeShoppingUnit(popupShopping.unit);

    await handleAsyncOperation(
      async () => {
        const msg = await updatePost(popupShopping.shoppingId, popupShopping.title, popupShopping.count, normalizedUnit, popupShopping.priorityColor);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
      }
    });
  };

  const handleUpdatePost = async () => {
    await handleUpdate();
    closeUpdatePopup();
  };

  const handleDelete = async (_id: string) => {
    if (!canWrite) {
      return;
    }

    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePost(_id);
          await sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) {
          setSuccess(msg.success);
        }
      });
    }
  };

  const handleDeleteList = async (shoppingListId: string, shoppingListName?: string) => {
    if (!canWrite) {
      return;
    }

    const confirmationMessage = shoppingListName
      ? `Supprimer le panier "${shoppingListName}" ?`
      : "Confirmer la suppression ?";

    if (confirm(confirmationMessage)) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePosts(shoppingListId);
          await sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) {
          setSuccess(msg.success);
        }
      });
    }
  };

  const handleCountChange = (quantity: { count: number; unit: string }) => {
    setIsCountValid(countRegex.test(String(quantity.count)));
    setCount(quantity.count);
    setUnit(normalizeShoppingUnit(quantity.unit));
  };

  const handleQuickAddCountChange = (quantity: { count: number; unit: string }) => {
    setIsQuickAddCountValid(countRegex.test(String(quantity.count)));
    setQuickAddItem((prevItem) => ({
      ...prevItem,
      count: quantity.count,
      unit: normalizeShoppingUnit(quantity.unit),
    }));
  };

  const handleQuickAddPriorityChange = (priorityColor: number) => {
    setQuickAddItem((prevItem) => ({
      ...prevItem,
      priorityColor,
    }));
  };

  const handleQuickAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    if (!activeList) {
      return;
    }

    const trimmedTitle = quickAddItem.title.trim();
    const normalizedUnit = normalizeShoppingUnit(quickAddItem.unit);

    if (!trimmedTitle || !isQuickAddCountValid) {
      return;
    }

    await handleAsyncOperation(
      async () => {
        const msg = await createPost(activeList._id, trimmedTitle, quickAddItem.count, normalizedUnit, quickAddItem.priorityColor);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
        setShoppingHistory((currentHistory) =>
          upsertShoppingHistory(currentHistory, {
            title: trimmedTitle,
            count: quickAddItem.count,
            unit: normalizedUnit,
            priorityColor: quickAddItem.priorityColor,
          })
        );
        setQuickAddItem(DEFAULT_QUICK_ADD);
        setIsQuickAddCountValid(true);
      }
    });
  };

  const handleNameChange = (shoppingItemId: string, name: string) => {
    if (!canWrite) {
      return;
    }

    setShoppingItems((oldShoppingItems) =>
      oldShoppingItems.map((shoppingItem) =>
        shoppingItem._id === shoppingItemId ? { ...shoppingItem, name } : shoppingItem
      )
    );
  };

  const handleSuggestionClick = (suggestion: { title: string; count: number; unit: string; priorityColor: number }) => {
    if (!canWrite) {
      return;
    }

    setQuickAddItem({
      title: suggestion.title,
      count: suggestion.count || 1,
      unit: normalizeShoppingUnit(suggestion.unit),
      priorityColor: suggestion.priorityColor ?? 0,
    });
    setIsQuickAddCountValid(true);
  };

  const handleDeleteHistoryEntry = (historyKey: string) => {
    if (!canWrite) {
      return;
    }

    setShoppingHistory((currentHistory) => currentHistory.filter((entry) => entry.key !== historyKey));
  };

  const nameInput = (shoppingItem: ShoppingDay): ReactNode => {
    return (
      <input
        type="text"
        className="input-field shopping-basket-name-input font-semibold"
        disabled={!canWrite}
        value={shoppingItem.name}
        onChange={(e) => handleNameChange(shoppingItem._id, e.target.value)}
        onBlur={() => handleUpdateDateItem(shoppingItem._id, shoppingItem.name, shoppingItem.date)}
        placeholder="Nom du panier"
      />
    );
  };

  const countInput = (): ReactNode => {
    return (
      <div className="post-popup-field">
        <span className="post-popup-label">Quantite</span>
        <QuantityInput count={popupShopping.count} unit={popupShopping.unit} onChange={handleCountChange} disabled={!canWrite} />
      </div>
    );
  };

  const getDisplayListName = (shoppingItem: ShoppingDay): string => {
    const trimmedName = shoppingItem.name.trim();

    if (!trimmedName || trimmedName.toLowerCase() === "shopping title" || trimmedName.toLowerCase() === "panier du moment") {
      return `Panier ${shoppingItem.date}`;
    }

    return trimmedName;
  };

  const getListAccentStyle = (index: number): CSSProperties => {
    const accent = SHOPPING_ACCENTS[index % SHOPPING_ACCENTS.length];

    return {
      ["--shopping-accent" as string]: accent.accent,
      ["--shopping-accent-soft" as string]: accent.soft,
      ["--shopping-accent-glow" as string]: accent.glow,
    };
  };

  const renderBasketPanel = (shoppingItem: ShoppingDay, index: number): ReactNode => (
    <div className="shopping-basket-panel" key={shoppingItem._id} data-basket-index={index} style={getListAccentStyle(index)}>
      <div className="shopping-basket-header">
        <div className="shopping-basket-topline">
          {nameInput(shoppingItem)}

          <div className="shopping-basket-tools">
            <div className="shopping-basket-date-wrap">
              <DatePicker
                selected={convertStringToDate(shoppingItem.date)}
                disabled={!canWrite}
                onChange={(date: Date | null) => {
                  if (date && !isNaN(date.getTime())) {
                    void handleUpdateDateItem(shoppingItem._id, shoppingItem.name, formatShoppingDate(date));
                  }
                }}
                locale="fr"
                dateFormat="P"
                className="datepicker-input shopping-basket-date-input"
                calendarClassName="theme-datepicker"
                popperClassName="theme-datepicker-popper"
              />
            </div>

            <button
              type="button"
              className="shopping-basket-delete"
              title="Supprimer le panier"
              disabled={!canWrite}
              onClick={() => {
                void handleDeleteList(shoppingItem._id, getDisplayListName(shoppingItem));
              }}
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>Supprimer</span>
            </button>
          </div>
        </div>

      </div>

      <PostValidationPopup
        postName="article"
        actionType="Modifier"
        showPopup={showUpdatePopup}
        togglePopup={closeUpdatePopup}
        handleValidate={handleUpdatePost}
        popupPost={popupShopping}
        setPopupPost={setTitle}
        setPriorityColor={setPriorityColor}
        inputs={countInput()}
        isFieldValid={isCountValid}
        compactPriorityPicker={true}
        priorityMode="select"
        priorityOptions={PRIORITY_OPTIONS}
      />

      <div className="shopping-basket-items">
        {shoppingItem.shoppingList.length === 0 && (
          <div className="shopping-basket-empty">
            <i className="fa-solid fa-cart-flatbed"></i>
            <p>Panier vide pour l'instant.</p>
            <span>Ajoute ton premier article pour commencer ce panier.</span>
          </div>
        )}

        {shoppingItem.shoppingList.length > 0 &&
          shoppingItem.shoppingList.map((post) => (
            <div key={post._id}>
              <ShoppingPost post={post} onUpdate={openUpdatePopup} onDelete={handleDelete} />
            </div>
          ))}
      </div>
    </div>
  );

  const isQuickAddReady = !!activeList && quickAddItem.title.trim() !== "" && quickAddItem.count > 0 && isQuickAddCountValid;

  return (
    <section className="card shopping-board-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="shopping-board-hero">
        <div className="shopping-board-head">
            <div className="shopping-board-copy">
              <p className="eyebrow">Courses du quotidien</p>
              <h1 className="shopping-board-title text-text-heading">
                <i className="fa-solid fa-basket-shopping text-primary"></i>
                Panier de courses
              </h1>
            </div>

          <button
            onClick={handleCreateDate}
            disabled={!canWrite || isCreatingList}
            className="shopping-board-create inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <i className="fa-solid fa-plus"></i>
            {isCreatingList ? "Creation..." : "Nouveau panier"}
          </button>
        </div>

        {!isLoadingLists && shoppingItems.length > 0 && activeList && (
          <>
            <div className="shopping-board-toolbar">
              <div className="shopping-board-switcher">
                <div className="shopping-board-switcher-copy">
                  <p className="shopping-board-switcher-label">Panier actif</p>
                </div>

                <div className="shopping-board-basket-rail" role="tablist" aria-label="Choisir le panier actif">
                  {shoppingItems.map((shoppingItem, index) => (
                    <div
                      key={shoppingItem._id}
                      className="shopping-basket-tab-shell"
                      style={getListAccentStyle(index)}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={shoppingItem._id === activeList._id}
                        className={[
                          "shopping-basket-tab",
                          canWrite ? "has-delete" : "",
                          shoppingItem._id === activeList._id ? "active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setSelectedListId(shoppingItem._id)}
                      >
                        <span className="shopping-basket-tab-name">{getDisplayListName(shoppingItem)}</span>
                        <span className="shopping-basket-tab-meta">
                          {shoppingItem.shoppingList.length} {shoppingItem.shoppingList.length > 1 ? "articles" : "article"}
                        </span>
                      </button>

                      {canWrite && (
                        <button
                          type="button"
                          className="shopping-basket-tab-remove"
                          title={`Supprimer ${getDisplayListName(shoppingItem)}`}
                          aria-label={`Supprimer ${getDisplayListName(shoppingItem)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteList(shoppingItem._id, getDisplayListName(shoppingItem));
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form className="shopping-quick-add" onSubmit={handleQuickAddSubmit}>
                <div className="shopping-quick-add-head">
                  <div>
                    <p className="eyebrow">Ajout rapide</p>
                    <h2 className="shopping-quick-add-title">Ajouter dans {getDisplayListName(activeList)}</h2>
                  </div>
                </div>

                <div className="shopping-quick-add-fields">
                  <label className="shopping-quick-add-field shopping-quick-add-field-title">
                    <span className="shopping-quick-add-label">Article</span>
                    <input
                      type="text"
                      className="input shopping-quick-add-input"
                      disabled={!canWrite}
                      value={quickAddItem.title}
                      onChange={(event) => setQuickAddItem((prevItem) => ({ ...prevItem, title: event.target.value }))}
                      placeholder="Lait, tomates, lessive..."
                    />
                  </label>

                  <div className="shopping-quick-add-field shopping-quick-add-field-qty">
                    <span className="shopping-quick-add-label">Quantite</span>
                    <QuantityInput
                      count={quickAddItem.count}
                      unit={quickAddItem.unit}
                      onChange={handleQuickAddCountChange}
                      disabled={!canWrite}
                    />
                  </div>

                  <label className="shopping-quick-add-field shopping-quick-add-field-priority">
                    <span className="shopping-quick-add-label">Priorite</span>
                    <select
                      className="input shopping-quick-add-select"
                      disabled={!canWrite}
                      value={quickAddItem.priorityColor}
                      onChange={(event) => handleQuickAddPriorityChange(Number(event.target.value))}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="submit" className="shopping-quick-add-button" disabled={!canWrite || !isQuickAddReady}>
                    <i className="fa-solid fa-plus"></i>
                    Ajouter au panier
                  </button>
                </div>

                {quickSuggestions.length > 0 && (
                  <div className="shopping-quick-picks-panel">
                    <p className="shopping-quick-picks-label">Articles souvent ajoutes</p>
                    <div className="shopping-quick-picks" aria-label="Historique des articles">
                      {quickSuggestions.map((suggestion) => (
                        <div key={suggestion.key} className="shopping-quick-pick">
                          <button
                            type="button"
                            className="shopping-quick-pick-main"
                            disabled={!canWrite}
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <i className="fa-solid fa-rotate-left"></i>
                            <span className="shopping-quick-pick-copy">{suggestion.title}</span>
                            <span className="shopping-quick-pick-count">{suggestion.frequency}x</span>
                          </button>

                          <button
                            type="button"
                            className="shopping-quick-pick-delete"
                            disabled={!canWrite}
                            onClick={() => handleDeleteHistoryEntry(suggestion.key)}
                            aria-label={`Supprimer ${suggestion.title} des articles souvent ajoutes`}
                            title="Supprimer de l'historique"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </>
        )}
      </div>

      <div className="shopping-board-main">
        {isLoadingLists && (
          <div className="shopping-board-loading">
            <i className="fa-solid fa-spinner animate-spin"></i>
            <span>Chargement des paniers...</span>
          </div>
        )}

        {!isLoadingLists && shoppingItems.length === 0 && (
          <div className="shopping-board-empty">
            <i className="fa-solid fa-basket-shopping text-primary"></i>
            <p>Aucun panier pour le moment.</p>
            <span>Ajoute un nouveau panier pour commencer.</span>
          </div>
        )}

        {!isLoadingLists && activeList && renderBasketPanel(activeList, activeListIndex)}
      </div>
    </section>
  );
};

export default ShoppingTab;
