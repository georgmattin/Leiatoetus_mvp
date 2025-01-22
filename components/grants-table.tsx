import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  
  interface Grant {
    status: string
    suitability: string
    provider: string
    name: string
    amount: string
    period: string
  }
  
  interface GrantsTableProps {
    grants: Grant[]
  }
  
  export function GrantsTable({ grants }: GrantsTableProps) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-b border-gray-200">
              <TableHead className="py-4 font-medium text-sm text-gray-600">Staatus</TableHead>
              <TableHead className="py-4 font-medium text-sm text-gray-600">Sobivus</TableHead>
              <TableHead className="py-4 font-medium text-sm text-gray-600">Toetuse pakkuja</TableHead>
              <TableHead className="py-4 font-medium text-sm text-gray-600">Toetuse nimi</TableHead>
              <TableHead className="py-4 font-medium text-sm text-gray-600">Toetuse summa</TableHead>
              <TableHead className="py-4 font-medium text-sm text-gray-600">Sulgemise aeg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((grant, index) => (
              <TableRow 
                key={index}
                className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0"
              >
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className="bg-[#008834]/10 text-[#008834] border-[#008834]/20 font-medium"
                  >
                    {grant.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className="bg-[#4383D7]/10 text-[#4383D7] border-[#4383D7]/20 font-medium"
                  >
                    {grant.suitability}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80" />
                    <div className="blur-[3px] select-none pointer-events-none text-gray-600">
                      {grant.provider}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80" />
                    <div className="blur-[3px] select-none pointer-events-none text-gray-600">
                      {grant.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80" />
                    <div className="blur-[3px] select-none pointer-events-none text-gray-600">
                      {grant.amount}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80" />
                    <div className="blur-[3px] select-none pointer-events-none text-gray-600">
                      {grant.period}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  
  