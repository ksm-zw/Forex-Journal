                    "use client";

                    import { useEffect, useState } from "react";
                    import DashboardHeaderV3 from "@/components/DashboardHeaderV3";

                    type Strategy = {
                      id: string;
                      strategy_name: string;
                      description: string;
                      market_type: string;
                      _count: {
                        trades: number;
                        rules: number;
                        entry_models: number;
                        timeframe_roles: number;
                      };
                    };

                    export default function StrategiesPage() {
                      const [strategies, setStrategies] = useState<Strategy[]>([]);
                      const [loading, setLoading] = useState(true);
                      const [showCreate, setShowCreate] = useState(false);
                      const [form, setForm] = useState({ strategy_name: "", description: "", market_type: "" });
                      const [creating, setCreating] = useState(false);
                      const [error, setError] = useState<string | null>(null);
                      const [editId, setEditId] = useState<string | null>(null);
                      const [editForm, setEditForm] = useState({ strategy_name: "", description: "", market_type: "" });
                      const [editLoading, setEditLoading] = useState(false);
                      const [deleteId, setDeleteId] = useState<string | null>(null);
                      const [deleteLoading, setDeleteLoading] = useState(false);

                      useEffect(() => {
                        const fetchStrategies = async () => {
                          try {
                            const res = await fetch("/api/strategies", {
                              headers: { "x-user-id": "demo@forex-research.com" },
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setStrategies(data.strategies);
                            }
                          } catch (error) {
                            console.error("Failed to fetch strategies:", error);
                          } finally {
                            setLoading(false);
                          }
                        };
                        fetchStrategies();
                      }, []);

                      return (
                        <div className="min-h-screen bg-background">
                          <DashboardHeaderV3 />
                          <div className="container mx-auto py-8">
                            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <h1 className="text-4xl font-bold mb-2">Trading Strategies</h1>
                                <p className="text-muted-foreground">Manage your trading strategies and monitor their performance</p>
                              </div>
                              <button className="btn btn-primary btn-compact px-6 py-2 rounded-lg font-semibold" onClick={() => setShowCreate(true)}>
                                + Create Strategy
                              </button>
                            </div>

                            {showCreate && (
                              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
                                  <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600" onClick={() => setShowCreate(false)} aria-label="Close">&times;</button>
                                  <h2 className="text-2xl font-bold mb-4">Create New Strategy</h2>
                                  {error && <div className="text-red-500 mb-2">{error}</div>}
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      setCreating(true);
                                      setError(null);
                                      try {
                                        const res = await fetch("/api/strategies", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json", "x-user-id": "demo@forex-research.com" },
                                          body: JSON.stringify(form),
                                        });
                                        if (res.ok) {
                                          setShowCreate(false);
                                          setForm({ strategy_name: "", description: "", market_type: "" });
                                          const data = await res.json();
                                          setStrategies((prev) => [data.strategy, ...prev]);
                                        } else {
                                          const err = await res.json();
                                          setError(err.error || "Failed to create strategy");
                                        }
                                      } catch (err) {
                                        setError("Failed to create strategy");
                                      } finally {
                                        setCreating(false);
                                      }
                                    }}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <label className="block font-medium mb-1">Name</label>
                                      <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={form.strategy_name} onChange={e => setForm(f => ({ ...f, strategy_name: e.target.value }))} required />
                                    </div>
                                    <div>
                                      <label className="block font-medium mb-1">Description</label>
                                      <textarea className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                                    </div>
                                    <div>
                                      <label className="block font-medium mb-1">Market Type</label>
                                      <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={form.market_type} onChange={e => setForm(f => ({ ...f, market_type: e.target.value }))} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-compact w-full mt-2" disabled={creating}>
                                      {creating ? "Creating..." : "Create Strategy"}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}

                            {loading ? (
                              <div className="text-center py-12">Loading strategies...</div>
                            ) : strategies.length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">No strategies found. Create your first strategy to get started.</div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {strategies.map((strategy) => (
                                  <div key={strategy.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow relative">
                                    <div className="absolute top-2 right-2 flex gap-2" style={{ zIndex: 2 }}>
                                      <button className="btn btn-compact btn-primary text-xs px-2 py-1" onClick={() => {
                                        setEditId(strategy.id);
                                        setEditForm({ strategy_name: strategy.strategy_name, description: strategy.description, market_type: strategy.market_type });
                                      }}>Edit</button>
                                      <button className="btn btn-compact btn-danger text-xs px-2 py-1" onClick={() => setDeleteId(strategy.id)}>Delete</button>
                                    </div>
                                    <div className="cursor-pointer" onClick={() => (window.location.href = `/strategies/${strategy.id}`)}>
                                      <h3 className="text-lg font-semibold mb-2">{strategy.strategy_name}</h3>
                                      <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium">Trades:</span> {strategy._count.trades}</div>
                                        <div><span className="font-medium">Rules:</span> {strategy._count.rules}</div>
                                        <div><span className="font-medium">Entry Models:</span> {strategy._count.entry_models}</div>
                                        <div><span className="font-medium">Timeframes:</span> {strategy._count.timeframe_roles}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Edit Modal */}
                            {editId && (
                              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
                                  <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600" onClick={() => setEditId(null)} aria-label="Close">&times;</button>
                                  <h2 className="text-2xl font-bold mb-4">Edit Strategy</h2>
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      setEditLoading(true);
                                      try {
                                        const res = await fetch(`/api/strategies/${editId}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json", "x-user-id": "demo@forex-research.com" },
                                          body: JSON.stringify(editForm),
                                        });
                                        if (res.ok) {
                                          const data = await res.json();
                                          setStrategies((prev) => prev.map(s => s.id === editId ? { ...s, ...data.strategy } : s));
                                          setEditId(null);
                                        }
                                      } finally {
                                        setEditLoading(false);
                                      }
                                    }}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <label className="block font-medium mb-1">Name</label>
                                      <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.strategy_name} onChange={e => setEditForm(f => ({ ...f, strategy_name: e.target.value }))} required />
                                    </div>
                                    <div>
                                      <label className="block font-medium mb-1">Description</label>
                                      <textarea className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                                    </div>
                                    <div>
                                      <label className="block font-medium mb-1">Market Type</label>
                                      <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.market_type} onChange={e => setEditForm(f => ({ ...f, market_type: e.target.value }))} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-compact w-full mt-2" disabled={editLoading}>
                                      {editLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}

                            {/* Delete Modal */}
                            {deleteId && (
                              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
                                  <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600" onClick={() => setDeleteId(null)} aria-label="Close">&times;</button>
                                  <h2 className="text-2xl font-bold mb-4">Delete Strategy</h2>
                                  <p className="mb-6">Are you sure you want to delete this strategy? This cannot be undone.</p>
                                  <div className="flex gap-4">
                                    <button className="btn btn-danger btn-compact flex-1" disabled={deleteLoading} onClick={async () => {
                                      setDeleteLoading(true);
                                      try {
                                        const res = await fetch(`/api/strategies/${deleteId}`, {
                                          method: "DELETE",
                                          headers: { "x-user-id": "demo@forex-research.com" },
                                        });
                                        if (res.ok) {
                                          setStrategies((prev) => prev.filter(s => s.id !== deleteId));
                                          setDeleteId(null);
                                        }
                                      } finally {
                                        setDeleteLoading(false);
                                      }
                                    }}>{deleteLoading ? "Deleting..." : "Delete"}</button>
                                    <button className="btn btn-compact flex-1" onClick={() => setDeleteId(null)}>Cancel</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    setEditLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-medium mb-1">Name</label>
                  <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.strategy_name} onChange={e => setEditForm(f => ({ ...f, strategy_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Market Type</label>
                  <input className="w-full border rounded px-3 py-2 bg-gray-900 text-white" value={editForm.market_type} onChange={e => setEditForm(f => ({ ...f, market_type: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary btn-compact w-full mt-2" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600" onClick={() => setDeleteId(null)} aria-label="Close">&times;</button>
              <h2 className="text-2xl font-bold mb-4">Delete Strategy</h2>
              <p className="mb-6">Are you sure you want to delete this strategy? This cannot be undone.</p>
              <div className="flex gap-4">
                <button className="btn btn-danger btn-compact flex-1" disabled={deleteLoading} onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    const res = await fetch(`/api/strategies/${deleteId}`, {
                      method: "DELETE",
                      headers: { "x-user-id": "demo@forex-research.com" },
                    });
                    if (res.ok) {
                      setStrategies((prev) => prev.filter(s => s.id !== deleteId));
                      setDeleteId(null);
                    }
                  } finally {
                    setDeleteLoading(false);
                  }
                }}>{deleteLoading ? "Deleting..." : "Delete"}</button>
                <button className="btn btn-compact flex-1" onClick={() => setDeleteId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
                                    className="absolute top-2 right-2 flex gap-2"
                                    style={{ zIndex: 2 }}
                                  >
                                    <button
                                      className="btn btn-compact btn-primary text-xs px-2 py-1"
                                      onClick={() => {
                                        setEditId(strategy.id);
                                        setEditForm({
                                          strategy_name: strategy.strategy_name,
                                          description: strategy.description,
                                          market_type: strategy.market_type,
                                        });
                                      }}
                                    >Edit</button>
                                    <button
                                      className="btn btn-compact btn-danger text-xs px-2 py-1"
                                      onClick={() => setDeleteId(strategy.id)}
                                    >Delete</button>
                                  </div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => (window.location.href = `/strategies/${strategy.id}`)}
                                  >
                                    <h3 className="text-lg font-semibold mb-2">{strategy.strategy_name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Trades:</span> {strategy._count.trades}
                                      </div>
                                      <div>
                                        <span className="font-medium">Rules:</span> {strategy._count.rules}
                                      </div>
                                      <div>
                                        <span className="font-medium">Entry Models:</span> {strategy._count.entry_models}
                                      </div>
                                      <div>
                                        <span className="font-medium">Timeframes:</span> {strategy._count.timeframe_roles}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Edit Modal */}
                          {editId && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                              <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
                                <button
                                  className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600"
                                  onClick={() => setEditId(null)}
                                  aria-label="Close"
                                >
                                  &times;
                                </button>
                                <h2 className="text-2xl font-bold mb-4">Edit Strategy</h2>
                                <form
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    setEditLoading(true);
                                    try {
                                      const res = await fetch(`/api/strategies/${editId}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'x-user-id': 'demo@forex-research.com',
                                        },
                                        body: JSON.stringify(editForm),
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        setStrategies((prev) => prev.map(s => s.id === editId ? { ...s, ...data.strategy } : s));
                                        setEditId(null);
                                      }
                                    } finally {
                                      setEditLoading(false);
                                    }
                                  }}
                                  className="space-y-4"
                                >
                                  <div>
                                    <label className="block font-medium mb-1">Name</label>
                                    <input
                                      className="w-full border rounded px-3 py-2 bg-gray-900 text-white"
                                      value={editForm.strategy_name}
                                      onChange={e => setEditForm(f => ({ ...f, strategy_name: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block font-medium mb-1">Description</label>
                                    <textarea
                                      className="w-full border rounded px-3 py-2 bg-gray-900 text-white"
                                      value={editForm.description}
                                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <label className="block font-medium mb-1">Market Type</label>
                                    <input
                                      className="w-full border rounded px-3 py-2 bg-gray-900 text-white"
                                      value={editForm.market_type}
                                      onChange={e => setEditForm(f => ({ ...f, market_type: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className="btn btn-primary btn-compact w-full mt-2"
                                    disabled={editLoading}
                                  >
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}

                          {/* Delete Modal */}
                          {deleteId && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                              <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-md relative">
                                <button
                                  className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600"
                                  onClick={() => setDeleteId(null)}
                                  aria-label="Close"
                                >
                                  &times;
                                </button>
                                <h2 className="text-2xl font-bold mb-4">Delete Strategy</h2>
                                <p className="mb-6">Are you sure you want to delete this strategy? This cannot be undone.</p>
                                <div className="flex gap-4">
                                  <button
                                    className="btn btn-danger btn-compact flex-1"
                                    disabled={deleteLoading}
                                    onClick={async () => {
                                      setDeleteLoading(true);
                                      try {
                                        const res = await fetch(`/api/strategies/${deleteId}`, {
                                          method: 'DELETE',
                                          headers: { 'x-user-id': 'demo@forex-research.com' },
                                        });
                                        if (res.ok) {
                                          setStrategies((prev) => prev.filter(s => s.id !== deleteId));
                                          setDeleteId(null);
                                        }
                                      } finally {
                                        setDeleteLoading(false);
                                      }
                                    }}
                                  >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                  </button>
                                  <button
                                    className="btn btn-compact flex-1"
                                    onClick={() => setDeleteId(null)}
                                  >Cancel</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
