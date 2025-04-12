
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RoleSelectorProps {
  roles: { id: string; name: string }[];
  selectedRole: string | null;
  setSelectedRole: (id: string | null) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRole,
  setSelectedRole,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search job roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
        {filteredRoles.map((role) => (
          <Button
            key={role.id}
            variant={selectedRole === role.id ? "default" : "outline"}
            className="h-auto py-3 justify-start"
            onClick={() => setSelectedRole(role.id)}
          >
            {role.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
