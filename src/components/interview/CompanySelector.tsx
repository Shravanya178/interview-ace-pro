
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CompanySelectorProps {
  companies: { id: string; name: string }[];
  selectedCompany: string | null;
  setSelectedCompany: (id: string | null) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompany,
  setSelectedCompany,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {filteredCompanies.map((company) => (
          <Button
            key={company.id}
            variant={selectedCompany === company.id ? "default" : "outline"}
            className="h-auto py-4 justify-start flex-col items-center"
            onClick={() => setSelectedCompany(company.id)}
          >
            <span>{company.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CompanySelector;
