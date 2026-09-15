import { BusinessCardItem } from '../BusinessCardItem';
import React, { useState, useMemo } from 'react';
import type { BusinessCard } from '../../types';
import { Search, ArrowUpDown, Plus, Eye, Paperclip, MessageCircle } from 'lucide-react';

interface ContactsTabProps {
  cards: BusinessCard[];
  onOpenCardDetail: (card: BusinessCard) => void;
  onOpenQuickAttach: (card: BusinessCard) => void;
  onOpenScanner: () => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  cards,
  onOpenCardDetail,
  onOpenQuickAttach,
  onOpenScanner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'company'>('recent');

  const blocks = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.blockName) set.add(c.blockName);
    });
    return Array.from(set);
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          card.name.toLowerCase().includes(query) ||
          (card.company && card.company.toLowerCase().includes(query)) ||
          (card.title && card.title.toLowerCase().includes(query)) ||
          (card.email && card.email.toLowerCase().includes(query)) ||
          (card.phone && card.phone.toLowerCase().includes(query)) ||
          (card.whatsapp && card.whatsapp.toLowerCase().includes(query)) ||
          (card.wechat && card.wechat.toLowerCase().includes(query)) ||
          (card.notes && card.notes.toLowerCase().includes(query)) ||
          (card.tags && card.tags.some((t) => t.toLowerCase().includes(query))) ||
          (card.blockName && card.blockName.toLowerCase().includes(query));

        const matchesBlock = selectedBlock === 'ALL' || card.blockName === selectedBlock;

        return matchesSearch && matchesBlock;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
        return b.createdAt - a.createdAt;
      });
  }, [cards, searchQuery, selectedBlock, sortBy]);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in font-grotesk">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-syne text-xl font-bold text-[#181716]">All Contacts</h1>
          <p className="text-xs text-[#7C7875]">{cards.length} saved business cards</p>
        </div>
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:opacity-95 text-white font-syne font-bold text-xs rounded-full shadow-solar transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Scan Card
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, email, WhatsApp, WeChat..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] placeholder:text-[#7C7875] focus:outline-none focus:border-[#FF5722] focus:bg-white shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7C7875] hover:text-[#181716]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedBlock('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all ${
            selectedBlock === 'ALL'
              ? 'bg-[#181716] text-white font-bold shadow-2xs'
              : 'bg-[#EDE8E1] text-[#45423E] hover:bg-[#E0DAD1] font-semibold'
          }`}
        >
          All ({cards.length})
        </button>

        {blocks.map((block) => (
          <button
            key={block}
            onClick={() => setSelectedBlock(block)}
            className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all ${
              selectedBlock === block
                ? 'bg-[#181716] text-white font-bold shadow-2xs'
                : 'bg-[#EDE8E1] text-[#45423E] hover:bg-[#E0DAD1] font-semibold'
            }`}
          >
            {block}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-[#7C7875]">
        <span>Showing {filteredCards.length} contacts</span>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#7C7875]" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-[#181716] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <div className="space-y-3">
          {filteredCards.map((card) => (
            <BusinessCardItem
              key={card.id}
              card={card}
              onOpenCardDetail={onOpenCardDetail}
              onOpenQuickAttach={onOpenQuickAttach}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[28px] border border-[#EDE8E1] p-8 text-center shadow-porcelain-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6F4] text-[#7C7875] flex items-center justify-center mx-auto mb-3 border border-[#EDE8E1]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-syne text-sm font-bold text-[#181716] mb-1">No contacts match your filter</h3>
          <p className="text-xs text-[#7C7875] mb-4">Try adjusting your search query or clear the filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBlock('ALL');
            }}
            className="px-4 py-2 bg-[#FFF0EB] text-[#FF5722] font-bold text-xs rounded-full border border-[#FF5722]/30"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
