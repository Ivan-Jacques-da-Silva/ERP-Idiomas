interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  'data-testid'?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  iconColor,
  'data-testid': testId 
}: StatsCardProps) {
  
  const getIconBgColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100';
      case 'green': return 'bg-green-100';
      case 'purple': return 'bg-purple-100';
      case 'yellow': return 'bg-yellow-100';
      case 'red': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getIconTextColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div 
      className="bg-card rounded-lg border border-border p-6 shadow-sm card-hover transition-smooth"
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground" data-testid={`${testId}-value`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor(changeType)}`}>
              {changeType === 'positive' && <i className="fas fa-arrow-up mr-1"></i>}
              {changeType === 'negative' && <i className="fas fa-arrow-down mr-1"></i>}
              <span data-testid={`${testId}-change`}>{change}</span>
              {changeType !== 'neutral' && ' este mês'}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${getIconBgColor(iconColor)} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${getIconTextColor(iconColor)} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
